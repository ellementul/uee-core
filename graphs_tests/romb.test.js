import test from 'ava'
import { MemberFactory, EventFactory, Types } from '../index.js'

function later(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

test('Romb graph: logical flow', async t => {
  // === 1. Построение графа ===
  
    const top = new MemberFactory("top")
    top.makeRoom()
    
    const roomA = new MemberFactory("roomA")
    roomA.makeRoom()
    top.addMember(roomA)
    
    const roomB = new MemberFactory("roomB")
    roomB.makeRoom()
    top.addMember(roomB)
    
    const bottom = new MemberFactory("bottom")
    roomA.addMember(bottom)
    roomB.addMember(bottom)
    
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
        [top, roomA, roomB, bottom].forEach(member => {
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
        roomA: 2,
        roomB: 2,
    }

    const receivedCounts = {}
    for (let key in receivedEvents) {
        receivedCounts[key] = receivedEvents[key].length
    }
    
    t.deepEqual(receivedCounts, expectedCounts, 
        `Каждый участник должен получить ожидаемое количество событий`)
})


test('Romb graph: all rooms', async t => {
  // === 1. Построение графа ===
  
    const top = new MemberFactory("top")
    top.makeRoom()
    
    const roomA = new MemberFactory("roomA")
    roomA.makeRoom()
    top.addMember(roomA)
    
    const roomB = new MemberFactory("roomB")
    roomB.makeRoom()
    top.addMember(roomB)
    
    const bottom = new MemberFactory("bottom")
    bottom.makeRoom()
    roomA.addMember(bottom)
    roomB.addMember(bottom)
    
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
        [top, roomA, roomB, bottom].forEach(member => {
            member.subscribe(eventType, (msg) => callback(member.name(), msg), true)
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
        roomA: 2,
        roomB: 2,
        bottom: 2
    }

    const receivedCounts = {}
    for (let key in receivedEvents) {
        receivedCounts[key] = receivedEvents[key].length
    }
    
    t.deepEqual(receivedCounts, expectedCounts, 
        `Каждый участник должен получить ожидаемое количество событий`)
})