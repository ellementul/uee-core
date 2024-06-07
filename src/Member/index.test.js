import test from 'ava'
import sinon from "sinon"

import { memberFactory } from './index.js'
import { EventFactory, Types } from '../Event/index.js'
import { Provider } from '../Provider/index.js'

import connectedEvent from './events/connected_event.js'
import changeEvent from './events/change_state_event.js'
import errorEvent from './events/error_event.js'
import logEvent from './events//log_event.js'



test('constructor', t => {
  const member = new memberFactory
  t.truthy(member)
})

// test('setProvider', t => {
//   const member = new Member
//   const provider = new Provider

//   member.setProvider(provider)
//   t.truthy(member)
// })

// test('Defined event', t => {
//   const member = new Member
//   const provider = new Provider
//   const event = EventFactory(Types.Index.Def(7))
//   const callback = sinon.fake()
//   member.onEvent(event, callback)

//   member.setProvider(provider)
  
//   provider.sendEvent(1)

//   t.true(callback.calledOnceWith(1))
// })

// test('Defined event before provider', t => {
//   const member = new Member
//   const provider = new Provider

//   const event = EventFactory(Types.Index.Def(7))
//   const callback = sinon.fake()
//   member.onEvent(event, callback)

//   member.setProvider(provider)
  
//   provider.sendEvent(1)

//   t.true(callback.calledOnceWith(1))
// })

// test('Duplicate defined', t => {
//   const member = new Member

//   const event = EventFactory(Types.Index.Def(7))
//   const callback = sinon.fake()
//   member.onEvent(event, callback)
  
//   t.throws(() => member.onEvent(event, callback), { message: /^Duplicated.*/ })
// })

// test('Send generated event', t => {
//   const member = new Member
//   const provider = new Provider
//   const type = Types.Object.Def({system: "Testing"})
//   const event = EventFactory(type)
//   const callback = sinon.fake()

//   member.setProvider(provider)
//   member.onEvent(event, callback)

//   provider.sendEvent(event.create())

//   t.true(callback.calledOnceWith({"system": "Testing"}))
// })

// test('Send message for listening event', t => {
//   const member = new Member
//   const provider = new Provider
//   const type = Types.Object.Def({ system: "Testing" })
//   const event = EventFactory(type)
//   const callback = sinon.fake()
//   member.onEvent(event, callback)

//   console.warn = sinon.fake()

//   member.send(event)
//   member.setProvider(provider)
//   member.send(event)

//   t.true(console.warn.calledTwice)
// })

// test('Deep merge template with payload', t => {
//   const member = new Member
//   const provider = new Provider

//   const type = Types.Object.Def({ 
//     system: "Testing", 
//     state: {
//       someProperty: "Check that it will be copied from template",
//       overwriteProperty: Types.Index.Def(1000000000),
//       array: Types.Array.Def(Types.Index.Def(1000000000), 50)
//     }
//   })
//   const event = EventFactory(type)
//   member.setProvider(provider)
  
//   const callback = sinon.fake()
//   provider.onEvent(event, callback)

//   member.send(event, { state: { overwriteProperty: 7, array: [3, 4] } })

//   t.true(callback.calledOnceWith({
//     system: "Testing",
//     state: {
//         overwriteProperty: 7,
//         someProperty: "Check that it will be copied from template",
//         array: [3, 4]
//       },
//   }))
// })

// test('Limit Calls of Event in Runtime', t => {
//   const member = new Member
//   const provider = new Provider

//   const event = EventFactory(Types.Object.Def({ system: "Testing" }))
//   const runtimeEvent = EventFactory(Types.Object.Def({ system: "Testing2" }))

//   const callback = sinon.fake()
//   member.onEvent(event, callback)

//   member.setProvider(provider)
  
//   const runtimeCallback = sinon.fake()
//   member.onEvent(runtimeEvent, runtimeCallback)

//   provider.sendEvent(event.create())
//   provider.sendEvent(runtimeEvent.create())

//   t.true(callback.calledOnce)
//   t.true(runtimeCallback.calledOnce)

//   provider.sendEvent(event.create())
//   provider.sendEvent(runtimeEvent.create())

//   t.true(callback.calledTwice)
//   t.true(runtimeCallback.calledOnce)
// })

// test('Deleting event', t => {
//   const member = new Member
//   const provider = new Provider

//   const type = Types.Object.Def({system: "Testing"})

//   const event = EventFactory(type)
//   const callback = sinon.fake()
//   member.onEvent(event, callback)

//   const wrongDeleting = () => member.offEvent(event)

//   t.throws(wrongDeleting, { message: "Only after setting provider!" })

//   member.setProvider(provider)

//   provider.sendEvent(event.create())
//   t.true(callback.calledOnce)
  
//   member.offEvent(event)

//   provider.sendEvent(event.create())
//   t.true(callback.calledOnce)

//   member.onEvent(event, callback)

//   provider.sendEvent(event.create())
//   t.true(callback.calledTwice)
// })


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

// test('Logging', t => {
//   const member = new Member
//   const provider = new Provider
//   const callback = sinon.fake()
  
//   provider.onEvent(logEvent, callback)
//   member.setProvider(provider)
//   const message = {
//     entity: "Run_Test",
//     state: "Update"
//   }
//   member.send(logEvent, message)

//   const fullMessage = {
//     ...logEvent.create(),
//     ...message
//   }
//   t.true(callback.calledOnceWith(fullMessage))
// })


// test('The error in callback', t => {
//   t.plan(3)

//   const member = new Member
//   const provider = new Provider

//   const errorCallback = sinon.spy(({ state: { name, message } }) => {
//     t.is(name, "Error")
//     t.is(message, "Testing Error")
//   })
//   provider.onEvent(errorEvent, errorCallback)

//   const event = EventFactory(Types.Key.Def())
//   const callbackWithError = () => {
//     throw new Error("Testing Error")
//   }
//   member.onEvent(event, callbackWithError)
//   member.setProvider(provider)
//   provider.sendEvent("GettingError")

//  t.true(errorCallback.calledOnce)
// })

// test('Invalid payload for event', t => {
//   const member = new Member
//   const provider = new Provider

//   const type = Types.Object.Def({
//     system: "Test",
//     action: "TestInvalidPayload",
//     state: {
//       correctState: true
//     }
//   })
  
//   const testEvent = EventFactory(type)

//   member.setProvider(provider)


//   const getError = () => member.send(testEvent, { state: { correctState: false } })

//   t.throws(getError, { instanceOf: TypeError })
//   t.throws(getError, { message: /validError/ })
//   t.throws(getError, { message: /template/ })
//   t.throws(getError, { message: /payload/ })
// })