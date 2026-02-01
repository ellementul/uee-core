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

    t.true(member.isReadyToSend)
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
  t.true(mainRoom.tools.room.members.has(childRoom.uuid))
  t.true(mainRoom.tools.room.members.has(mainMember.uuid))
  t.true(childRoom.tools.room.members.has(member.uuid))

  // Setup onDestroy callbacks
  const childRoomDestroyed = sinon.fake()
  const memberDestroyed = sinon.fake()
  childRoom.onDestroy = childRoomDestroyed
  member.onDestroy = memberDestroyed

  // Delete the child room
  mainRoom.deleteMember(childRoom.uuid)

  // Verify child room is removed from main room
  t.false(mainRoom.tools.room.members.has(childRoom.uuid))
  t.true(mainRoom.tools.room.members.has(mainMember.uuid))
  
  // Verify child room's outsideRoom is cleared
  t.falsy(childRoom.outsideRoom)
  
  // Verify member's outsideRoom is cleared
  t.falsy(member.outsideRoom)
  
  // Verify child room's members map is empty
  t.is(childRoom.tools.room.members.size, 0)

  // Verify onDestroy callbacks were called
  t.true(childRoomDestroyed.calledOnce, 'Child room onDestroy should be called')
  t.true(memberDestroyed.calledOnce, 'Member onDestroy should be called')
})
