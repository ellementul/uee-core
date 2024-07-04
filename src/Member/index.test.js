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

// test('Unsubscribe', t => {})

// test('AddMember', t => {})
// test('DeleteMember', t => {})


// test('connected', t => {
//   const member = new Member
//   const provider = new Provider
//   const callback = sinon.fake()

//   provider.onEvent(connectedEvent, callback)
//   member.setProvider(provider)

//   t.true(callback.calledOnceWith({
//     ...connectedEvent.create(),
//     role: "MemberWithoutRole",
//     uuid: member.uuid
//   }))
// })

// test('any change member state', t => {
//   const member = new Member
//   const provider = new Provider
//   const callback = sinon.fake()
  
//   provider.onEvent(changeEvent, callback)
//   member.role = "TestRole"
//   member.setProvider(provider)

//   const payload = {
//     ...changeEvent.create(),
//     state: "Connected",
//     role: "TestRole",
//     uuid: member.uuid
//   }
//   t.true(callback.calledOnceWith(payload))
// })