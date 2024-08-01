import test from 'ava'
import sinon from "sinon"
import { EventFactory, Types } from './index.js'

test('constructor', t => {
		const event = EventFactory(Types.Index.Def(7))
		t.truthy(event)
})

test('signature', t => {
	const event = EventFactory(Types.Object.Def({ system: "Test" }))
	t.is(event.sign(), "4a65687e-1443-53f1-924b-cd67a9ddc745")
})

test('create', t => {
	const event = EventFactory(Types.Object.Def({ system: "Log" }))
	t.deepEqual(event.createMsg(), { payload: {"system": "Log"}, accessLvl: 0 })
})

test('validation', t => {
	const event = EventFactory(Types.Object.Def({ system: "Log" }))

	t.true(event.isValid({ payload: {"system": "Log"}, accessLvl: 0 }))
	t.true(event.isValid({ payload: {"system": "Log"}, accessLvl: 1 }))

	t.false(event.isValid(7))
	t.falsy(event.getValidError({ payload: {"system": "Log"}, accessLvl: 1 }))
});

test('Invalid payload for event', t => {

	const type = Types.Object.Def({
		system: "Test",
		action: "TestInvalidPayload",
		state: {
			correctState: true
		}
	})
	
	const testEvent = EventFactory(type)


	const getError = () => testEvent.createMsg({ state: { correctState: false } }, true)

	t.throws(getError, { instanceOf: TypeError })
})

test('calling', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const firstCall = sinon.fake()
	const secondCall = sinon.fake()

	event.on("firstId", firstCall)
	event.on("secondId", secondCall)
	
	event.call({ payload })

	t.truthy(firstCall.calledWith(payload))
	t.truthy(secondCall.calledWith(payload))
})

test('calling with the same uuid', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const firstCall = sinon.fake()
	const secondCall = sinon.fake()

	event.on("theSameId", firstCall)
	event.on("theSameId", secondCall)
	
	event.call({ payload })

	t.truthy(firstCall.notCalled)
	t.truthy(secondCall.calledOnce)
})

test('delete callback', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const callback = sinon.fake()

	event.on("id", callback)
	
	event.call({ payload })
	t.truthy(callback.calledOnce)

	event.off("id")
	
	event.call({ payload })
	t.truthy(callback.calledOnce)
})

test('callback limtly calling', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const callback = sinon.fake()

	event.on("id", callback, 2)
	
	event.call({ payload })
	t.truthy(callback.calledOnce)
	
	event.call({ payload })
	t.truthy(callback.calledTwice)

	event.call({ payload })
	t.truthy(callback.calledTwice)
})

test('clone event', t => {
	const event = EventFactory(Types.Index.Def(7))
	const clonedEvent = event.clone()

	t.not(event, clonedEvent)
	t.is(event.sign(), clonedEvent.sign())
})

test('clone event with new access', t => {
	const event = EventFactory(Types.Index.Def(7))
	const clonedEvent = event.clone(1)

	t.not(event, clonedEvent)
	t.is(event.sign(), clonedEvent.sign())
	t.is(clonedEvent.accessLvl, 1)
})

test('Uint8Array', t => {
	const event = EventFactory(Types.Object.Def({}, true))
	const uint8 = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])
	const payload = {
		buffer: uint8
	}
	
	const msg = event.createMsg(payload, true)

	t.deepEqual(msg.payload, payload)
})