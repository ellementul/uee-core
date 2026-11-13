import test from 'ava'
import { MemberFactory, EventFactory, Types } from '../index.js'

function later(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

test('POS graph: logical flow', async t => {
  // === 1. Построение графа ===
  
    const top = new MemberFactory("top")
    top.makeRoom()
    
    //----

    const roomA1 = new MemberFactory("roomA1")
    roomA1.makeRoom()
    top.addMember(roomA1)
    
    const roomB1 = new MemberFactory("roomB1")
    roomB1.makeRoom()
    top.addMember(roomB1)

    //----
    const roomA2 = new MemberFactory("roomA2")
    roomA2.makeRoom()
    roomA1.addMember(roomA2)
    
    const roomB2 = new MemberFactory("roomB2")
    roomB2.makeRoom()
    roomA1.addMember(roomB2)
    roomB1.addMember(roomB2)

    const roomC2 = new MemberFactory("roomC2")
    roomC2.makeRoom()
    roomB1.addMember(roomC2)

    //----
    const roomA3 = new MemberFactory("roomA3")
    roomA3.makeRoom()
    roomA2.addMember(roomA3)
    roomB2.addMember(roomA3)
    
    const roomB3 = new MemberFactory("roomB3")
    roomB3.makeRoom()
    roomB2.addMember(roomB3)
    roomC2.addMember(roomB3)

    //----
    const bottom = new MemberFactory("bottom")
    bottom.makeRoom()
    roomA3.addMember(bottom)
    roomB3.addMember(bottom)

    
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
        [
            top, 
            roomA1, 
            roomB1,
            roomA2, 
            roomB2,
            roomC2,
            roomA3, 
            roomB3, 
            bottom].forEach(member => {
            member.subscribe(eventType, (msg) => callback(member.name(), msg), false)
        })
    })
  
    // === 3. Генерация событий листьями ===
    
    bottom.send(eventTypes[0])
    bottom.send(eventTypes[1])
    
    // === 4. Проверка получения событий ===
    
    await later(100)
    
    // Проверяем количество полученных событий для каждого участника
    const expectedCounts = {
        top: 2,
        roomA1: 2,
        roomB1: 2,
        roomA2: 2,
        roomB2: 2,
        roomC2: 2,
        roomA3: 2,
        roomB3: 2
    }

    const receivedCounts = {}
    for (let key in receivedEvents) {
        receivedCounts[key] = receivedEvents[key].length
    }
    
    t.deepEqual(receivedCounts, expectedCounts, 
        `Каждый участник должен получить ожидаемое количество событий`)
})