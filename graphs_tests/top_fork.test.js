import test from 'ava'
import { MemberFactory, EventFactory, Types } from '../index.js'

function later(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

test('Cross graph: logical flow', async t => {
  // === 1. Построение графа ===
  
    const middle = new MemberFactory("middle")
    middle.makeRoom()
    
    const roomA = new MemberFactory("roomA")
    roomA.makeRoom()
    roomA.addMember(middle)
    
    const roomB = new MemberFactory("roomB")
    roomB.makeRoom()
    roomB.addMember(middle)
    
    // === 2. Подписка на события ===
    
    const eventTypes = [
        EventFactory(Types.Object.Def({ 
            system: "Leaf1", 
            sourceUid: Types.Key.Def(3), 
            timestamp: Types.Index.Def(2**53 - 1),
            hash: Types.Key.Def(3) 
        })),
        EventFactory(Types.Object.Def({ 
            system: "Leaf2", 
            sourceUid: Types.Key.Def(3), 
            timestamp: Types.Index.Def(2**53 - 1),
            hash: Types.Key.Def(3) 
        }))
    ]

    const receivedEvents = {}

    eventTypes.forEach((eventType, index) => {
        
        const callback = (memberName, msg) => {

            if(!receivedEvents[memberName])
                receivedEvents[memberName] = []

            receivedEvents[memberName].push(msg)
        }

        // Подписываем всех на событие
        [middle, roomA, roomB].forEach(member => {
            member.subscribe(eventType, (msg) => callback(member.name(), msg))
        })
    })
  
    // === 3. Генерация событий листьями ===
    
    middle.send(eventTypes[0], {})
    middle.send(eventTypes[1], {})
    
    // === 4. Проверка получения событий ===
    
    await later(100)
    
    // Проверяем количество полученных событий для каждого участника
    const expectedCounts = {
        middle: 2,      // Получает от обоих листьев через roomA и roomB
        roomA: 2,     // От leaf1 (прямой), root (через roomB)
        roomB: 2,     // От leaf2 (прямой), root (через roomA)
    }

    const receivedCounts = {}
    for (let key in receivedEvents) {
        receivedCounts[key] = receivedEvents[key].length
    }

    t.is(receivedEvents.middle.filter(({ system }) => system == 'Leaf2').length, 1)
    t.is(receivedEvents.middle.filter(({ system }) => system == 'Leaf1').length, 1)
    
    t.deepEqual(receivedCounts, expectedCounts, 
        `Каждый участник должен получить ожидаемое количество событий`)
})