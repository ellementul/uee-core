import test from 'ava'
import sinon from "sinon"

import { MemberFactory } from './index.js'
import { EventFactory, Types } from '../Event/index.js'
import { Provider } from '../Provider/index.js'

import connectedEvent from './events/connected_event.js'
import changeEvent from './events/change_state_event.js'
import errorEvent from './events/error_event.js'
import logEvent from './events//log_event.js'



test('constructor', t => {
  const member = new MemberFactory
  t.truthy(member)
})

test('makeRoom', t => {
  const member = new MemberFactory
  member.makeRoom()
  t.true(member.isRoom)
})

test('Subscribe', t => {
  const member = new MemberFactory
  member.makeRoom()

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()
  
  member.subscribe(event, callback)
  member.send(event)

  t.true(callback.calledOnceWith({ system: "test" }))
})

test('reciveAll', t => {
  const member = new MemberFactory
  member.makeRoom()

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()
  
  member.receiveAll = callback
  member.send(event)

  t.true(callback.calledOnceWith({ accessLvl: 0, payload: { system: 'test' } }))
})

test('onConnectRoom', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory

  const callback = sinon.fake()
  member.onConnectRoom = callback

  room.addMember(member)

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

  t.true(callback.calledOnceWith({ accessLvl: 0, payload: { system: 'test' } }))
})

test('subscribeEventOutside', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  member.subscribe(event, callback)
  member.send(event)

  t.true(callback.calledOnceWith({ system: "test" }))
})


test('wrong subscribe decrease access level', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  member.makeRoom()
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  member.subscribe(event, callback)
  room.send(event)

  t.false(callback.called)
})

test('right subscribe decrease access level', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  member.makeRoom()
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  member.subscribe(event.clone(1), callback)
  room.send(event)

  t.true(callback.calledOnceWith({ system: "test" }))
})

test('wrong subscribe increase access level', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  member.makeRoom()
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  room.subscribe(event, callback)
  member.send(event)

  t.false(callback.called)
})

test('right subscribe increase access level', t => {
  const room = new MemberFactory
  room.makeRoom()

  const member = new MemberFactory
  member.makeRoom()
  room.addMember(member)

  const event = EventFactory(Types.Object.Def({ system: "test" }))

  const callback = sinon.fake()
  room.subscribe(event, callback)
  member.send(event.clone(1))

  t.true(callback.calledOnceWith({ system: "test" }))
})

// test('Unsubscribe', t => {})


// test('DeleteMember', t => {})
