import test from 'ava'
import sinon from "sinon"

import { MemberFactory } from './index.js'
import { EventFactory, Types } from '../Event/index.js'
import { errorEvent } from './events.js'

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
  
  const callback = sinon.fake()
  member.onMakeRoom = callback
  member.makeRoom()

  t.true(member.isRoom)
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

test('reciveAll', t => {
  const member = new MemberFactory
  member.makeRoom()

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()
  
  member.receiveAll = callback
  member.send(event)

  t.true(callback.calledOnceWith({ system: 'test' }))
})

test('onConnectRoom', async t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()
  member.onConnectRoom = () => {
    member.subscribe(event, callback)
  }

  room.addMember(member)
  member.send(event)

  await later(0)

  t.true(callback.called)
})

test('receiveAll in room', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  room.receiveAll = callback
  member.send(event)

  t.true(callback.calledOnceWith({ system: 'test' }))
})

test('Error in callback', async t => {
  const room = new MemberFactory
  room.makeRoom({ debug: true })

  const member = new MemberFactory

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()
  console.error = sinon.fake()
  room.subscribe(errorEvent, callback)

  const callbackGenError = () => { throw new Error("Test error") }

  member.onConnectRoom = () => {
    member.subscribe(event, callbackGenError)
  }

  room.addMember(member)
  member.send(event)

  await later(100)

  t.true(callback.called)
})


// test('Unsubscribe', t => {})


// test('DeleteMember', t => {})
