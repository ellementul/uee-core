import test from 'ava'
import sinon from "sinon"
import { EventFactory, Types } from './index.js'

import json_type from './test_event.json' assert { type: 'json' }


test('constructor', t => {
		const event = EventFactory(Types.Index.Def(7))
		t.truthy(event)
})

test('signature', t => {
	const event = EventFactory(Types.Index.Def(7))
	t.is(event.sign(), "8c06eb0e-b55f-5156-bad8-676866da551e")
})

test('create', t => {
	const event = EventFactory(Types.Object.Def({ system: "Log" }))
	t.deepEqual(event.create(), {"system": "Log"})
})

test('validation', t => {
	const event = EventFactory(Types.Index.Def(7))
	t.is(event.isValid(5), true)
	t.is(event.isValid(7), false)
	t.is(event.isValidError(5), false)
	t.deepEqual(event.isValidError(7), {"type": {"name": "Index", "struct": {"max": 7}}, "value": 7})
});

test('calling', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const firstCall = sinon.fake()
	const secondCall = sinon.fake()

	event.on("firstId", firstCall)
	event.on("secondId", secondCall)
	
	event.call(payload)

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
	
	event.call(payload)

	t.truthy(firstCall.notCalled)
	t.truthy(secondCall.calledOnce)
})

test('delete callback', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const callback = sinon.fake()

	event.on("id", callback)
	
	event.call(payload)
	t.truthy(callback.calledOnce)

	event.off("id")
	
	event.call(payload)
	t.truthy(callback.calledOnce)
})

test('callback limtly calling', t => {
	const event = EventFactory(Types.Key.Def())
	const payload = "TestPayload"

	const callback = sinon.fake()

	event.on("id", callback, 2)
	
	event.call(payload)
	t.truthy(callback.calledOnce)
	
	event.call(payload)
	t.truthy(callback.calledTwice)

	event.call(payload)
	t.truthy(callback.calledTwice)
})

test('clone event', t => {
	const event = EventFactory(Types.Index.Def(7))
	const clonedEvent = event.clone()

	t.not(event, clonedEvent)
	t.deepEqual(event.sign(), clonedEvent.sign())
})

test('event from object', t => {
	const type = Types.Object.Def({
		system: "Testing",
		index: Types.Index.Def(100)
	})
	
	const json_event = EventFactory.fromJSON(json_type)
	const event = EventFactory(type)

	t.deepEqual(json_event.sign(), event.sign())
})

test('event to JSON', t => {
	const type = Types.Object.Def({
		system: "Testing",
		index: Types.Index.Def(100)
	})
	
	const event = EventFactory(type)
	const json_event = EventFactory.fromJSON(event.toJSON())

	t.deepEqual(json_event.sign(), event.sign())
})