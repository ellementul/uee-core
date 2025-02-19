import test from 'ava'
import sinon from "sinon"

import { Provider } from './index.js'
import { EventFactory, Types } from '../Event/index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}


test('constructor', t => {
  const provider = new Provider
  t.truthy(provider)
})


test('send event', async t => {
    const provider = new Provider

    const testEvent = EventFactory(Types.Object.Def({ testProp: "TestValue" }))
    const eventCallback = sinon.fake()
    provider.onEvent(testEvent, eventCallback, "test")

    provider.sendEvent(testEvent.createMsg())

    await later(0)

    t.true(eventCallback.called)
})

test('off event', async t => {
    const provider = new Provider

    const testEvent = EventFactory(Types.Object.Def({ testProp: "TestValue" }))
    const eventCallback = sinon.fake()
    provider.onEvent(testEvent, eventCallback, "test")

    provider.sendEvent(testEvent.createMsg())
    provider.offEvent(testEvent, "test")
    provider.sendEvent(testEvent.createMsg())

    await later(0)

    t.false(eventCallback.called)
})

const loadWeight = 128

test.skip('loaded', async t => {
    const provider = new Provider

    const testEvents = []
    const eventCallbacks = []
    const randKey = Types.Key.Def().rand
    for (let index = 0; index < loadWeight; index++) {
        const eventType = Types.Object.Def({["test"+index]: "Test" + randKey() })
        testEvents.push(EventFactory(eventType))
        eventCallbacks.push(sinon.fake())
    }

    const start = Date.now()
    
    testEvents.forEach((testEvent , i) => provider.onEvent(testEvent, eventCallbacks[i], "test"))

    for (let index = 0; index < loadWeight; index++) {
        testEvents.forEach(testEvent => provider.sendEvent(testEvent.createMsg()))
        await later(0)
    }

    const end = Date.now()
    const delta = end - start

    console.log("loadWeight: ", loadWeight, delta + "ms", "processed events: " + eventCallbacks.reduce((sum, callback) => sum + callback.callCount, 0))

    t.true(eventCallbacks.every(callback => callback.called))
})