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

test('subscribeEventOutside', async t => {
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


// test('Unsubscribe', t => {})


// test('DeleteMember', t => {})
