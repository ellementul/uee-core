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
    
    const leaf1 = new MemberFactory("leaf1")
    middle.addMember(leaf1)
    
    const leaf2 = new MemberFactory("leaf2")
    middle.addMember(leaf2)
    
    // === 2. Подписка на события ===
    
    const eventTypes = [
        EventFactory(Types.Object.Def({ system: "Leaf1", sourceUid: Types.Key.Def(3), timestamp: Types.Key.Def(3) })),
        EventFactory(Types.Object.Def({ system: "Leaf2", sourceUid: Types.Key.Def(3), timestamp: Types.Key.Def(3) }))
    ]
    const receivedEvents = {}

    eventTypes.forEach((eventType, index) => {
        
        const callback = (memberName, msg) => {
            console.log(memberName, msg)
            if(!receivedEvents[memberName])
                receivedEvents[memberName] = []

            receivedEvents[memberName].push(msg)
        }

        // Подписываем всех на событие
        [middle, roomA, roomB, leaf1, leaf2].forEach(member => {
            member.subscribe(eventType, (msg) => callback(member.name(), msg))
        })
    })
  
    // === 3. Генерация событий листьями ===
    
    leaf1.send(eventTypes[0], { sourceUid: leaf1.uid(), timestamp: Date.now().toString() })
    leaf2.send(eventTypes[1], { sourceUid: leaf2.uid(), timestamp: Date.now().toString() })
    
    // === 4. Проверка получения событий ===
    
    await later(100)
    
    // Проверяем количество полученных событий для каждого участника
    const expectedCounts = {
        middle: 2,      // Получает от обоих листьев через roomA и roomB
        roomA: 2,     // От leaf1 (прямой), root (через roomB)
        roomB: 2,     // От leaf2 (прямой), root (через roomA)
        leaf1: 1,     // От root через roomA и roomB
        leaf2: 1      // От root через roomA и roomB
    }

    const receivedCounts = {}
    for (let key in receivedEvents) {
        receivedCounts[key] = receivedEvents[key].length
    }

    t.is(receivedEvents.leaf1.filter(({ system }) => system == 'Leaf2').length, 1)
    t.is(receivedEvents.leaf2.filter(({ system }) => system == 'Leaf1').length, 1)
    
    t.deepEqual(receivedCounts, expectedCounts, 
        `Каждый участник должен получить ожидаемое количество событий`)
})