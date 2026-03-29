import test from 'ava'
import sinon from "sinon"

import { MemberFactory } from './index.js'
import { EventFactory, Types } from '../Event/index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}


test('constructor', t => {
    const member = new MemberFactory
    t.truthy(member)
})

test('makeRoom', t => {
    const member = new MemberFactory
    member.makeRoom()

    t.true(member.isReadyToSend())
})

test('entre Room', t => {
    const room = new MemberFactory
    room.makeRoom()
    
    const callback = sinon.fake()
    const member = new MemberFactory
    member.onJoinRoom = callback

    room.addMember(member)

    t.true(callback.called)
})

test('Subscribe', async t => {
    const member = new MemberFactory
    member.makeRoom()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const callback = sinon.fake()
    
    member.subscribe(event, callback)
    member.send(event)

    await later(0)

    t.true(callback.calledOnceWith({ system: "test" }))
})

test('subscribeToOutsideRoom', async t => {
    const room = new MemberFactory
    room.makeRoom()

    const member = new MemberFactory
    room.addMember(member)

    const event = EventFactory(Types.Object.Def({ system: "test" }))

    const callback = sinon.fake()
    member.subscribe(event, callback)
    member.send(event)

    await later(0)

    t.true(callback.calledOnceWith({ system: "test" }))
})

test('three room: bubbling and subscribe level up', async t => {
  const host = new MemberFactory()
  const client1 = new MemberFactory()
  const client2 = new MemberFactory()
  
  host.makeRoom()
  client1.makeRoom()
  client2.makeRoom()
  
  host.addMember(client1)
  host.addMember(client2)
  
    const event = EventFactory(Types.Object.Def({ system: "test", sourceUid: Types.Key.Def(3) }))

    const gotClient1 = []
    client1.subscribe(event, (payload) => gotClient1.push(payload), false, client1.uid())

    const gotClient2 = []
    client2.subscribe(event, (payload) => gotClient2.push(payload))

    client2.send(event, { sourceUid: client2.uid() })
    
    await later(100)
    
    t.is(gotClient1.length, 1)
    t.is(gotClient2.length, 2)
})

test('Bubble event', async t => {
    const room = new MemberFactory
    room.makeRoom()

    const secondRoom = new MemberFactory
    secondRoom.makeRoom()
    room.addMember(secondRoom)

    const member = new MemberFactory
    secondRoom.addMember(member)

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const callback = sinon.fake()
    room.subscribe(event, callback)

    member.send(event)

    await later(0)

    t.true(callback.called)
})

test('Bubble filter', async t => {
    const allowEvent = EventFactory(Types.Object.Def({ system: "allowed" }))
    const deprecatedEvent = EventFactory(Types.Object.Def({ system: "deprecated" }))

    const allowCallback = sinon.fake()
    const deprecatedCallback = sinon.fake()

    const room = new MemberFactory
    room.makeRoom()

    const secondRoom = new MemberFactory
    secondRoom.makeRoom({ outEvents: [allowEvent] })
    room.addMember(secondRoom)

    const member = new MemberFactory
    secondRoom.addMember(member)

    room.subscribe(allowEvent, allowCallback)
    room.subscribe(deprecatedEvent, deprecatedCallback)

    member.send(allowEvent)
    member.send(deprecatedEvent)

    await later(0)

    t.true(allowCallback.called)
    t.false(deprecatedCallback.called)
})

test('Subscribe up level', async t => {
    const room = new MemberFactory
    room.makeRoom()

    const secondRoom = new MemberFactory
    secondRoom.makeRoom()
    room.addMember(secondRoom)

    const member = new MemberFactory
    secondRoom.addMember(member)

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const callback = sinon.fake()
    member.subscribe(event, callback)

    room.send(event)

    await later(0)

    t.true(callback.called)
})

test('Subscribe up level filter', async t => {
    const allowEvent = EventFactory(Types.Object.Def({ system: "allowed" }))
    const deprecatedEvent = EventFactory(Types.Object.Def({ system: "deprecated" }))

    const allowCallback = sinon.fake()
    const deprecatedCallback = sinon.fake()

    const room = new MemberFactory
    room.makeRoom()

    const secondRoom = new MemberFactory
    secondRoom.makeRoom({ inEvents: [allowEvent] })
    room.addMember(secondRoom)

    const member = new MemberFactory
    secondRoom.addMember(member)

    member.subscribe(allowEvent, allowCallback)
    member.subscribe(deprecatedEvent, deprecatedCallback)

    room.send(allowEvent)
    room.send(deprecatedEvent)

    await later(0)

    t.true(allowCallback.called)
    t.false(deprecatedCallback.called)
})

test('Unsubscribe', async t => {
    const member = new MemberFactory
    member.makeRoom()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const callback = sinon.fake()
    
    member.subscribe(event, callback)
    member.send(event)
    await later(0)
    t.true(callback.calledOnceWith({ system: "test" }))

    // Reset the callback
    callback.resetHistory()
    
    // Unsubscribe and send event again
    member.unsubscribe(event)
    member.send(event)
    await later(0)
    
    t.false(callback.called, 'Callback should not be called after unsubscribe')
})

test('DeleteMember', t => {
  // Create main room
  const mainRoom = new MemberFactory
  mainRoom.makeRoom()

  // Create child room
  const childRoom = new MemberFactory
  childRoom.makeRoom()
  mainRoom.addMember(childRoom)

  // Create member in child room
  const member = new MemberFactory
  childRoom.addMember(member)

  // Create another member in main room
  const mainMember = new MemberFactory
  mainRoom.addMember(mainMember)

  // Verify initial setup
  t.true(mainRoom.tools.room.members.has(childRoom.uid()))
  t.true(mainRoom.tools.room.members.has(mainMember.uid()))
  t.true(childRoom.tools.room.members.has(member.uid()))

  // Setup onDestroy callbacks
  const childRoomDestroyed = sinon.fake()
  const memberDestroyed = sinon.fake()
  childRoom.onDestroy = childRoomDestroyed
  member.onDestroy = memberDestroyed

  // Delete the child room
  mainRoom.deleteMember(childRoom.uid())

  // Verify child room is removed from main room
  t.false(mainRoom.tools.room.members.has(childRoom.uid()))
  t.true(mainRoom.tools.room.members.has(mainMember.uid()))
  
  // Verify child room's outsideRoom is cleared
  t.falsy(childRoom.isOutsideRoom())
  
  // Verify member's outsideRoom is cleared
  t.falsy(member.isOutsideRoom())
  
  // Verify child room's members map is empty
  t.is(childRoom.tools.room.members.size, 0)

  // Verify onDestroy callbacks were called
  t.true(childRoomDestroyed.calledOnce, 'Child room onDestroy should be called')
  t.true(memberDestroyed.calledOnce, 'Member onDestroy should be called')
})
