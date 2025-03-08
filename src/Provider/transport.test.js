import test from 'ava'
import sinon from "sinon"

import { Provider } from './index.js'
import { EventFactory, Types } from '../Event/index.js'
import { InMemory } from '../Transports/InMemory/index.js'
import { connectionEvent, disconnectionEvent } from './events.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

test.before('constructor', t => {
    t.context.hostTransport = new InMemory({ id: "Test", isHost: true })
    t.context.clientTransport = new InMemory({ id: "Test", isHost: false })
    t.context.host = new Provider({ transport: t.context.hostTransport })
    t.context.client = new Provider({ transport: t.context.clientTransport })
})


test('constructor', t => {
  t.truthy(t.context.host.isTransport)
  t.truthy(t.context.client.isTransport)
})

test('connection', async t => {
    const host = t.context.host
    const client = t.context.client

    const connectHostCallback = sinon.fake()
    host.onEvent(connectionEvent, connectHostCallback)

    host.connect()
    await later(250)

    t.false(connectHostCallback.called)

    client.connect()
    await later(250)

    t.true(connectHostCallback.calledOnce)
})


test('send from client to host event', async t => {
    const host = t.context.host
    const client = t.context.client

    const testEvent = EventFactory(Types.Object.Def({ testProp: "TestValue" }))
    const eventCallback = sinon.fake()
    host.onEvent(testEvent, eventCallback)

    client.sendEvent(testEvent.createMsg())

    await later(0)

    t.true(eventCallback.calledOnce)
})

test('send from host to client event', async t => {
    const host = t.context.host
    const client = t.context.client

    const testEvent = EventFactory(Types.Object.Def({ testProp: "TestValue" }))
    const eventCallback = sinon.fake()
    client.onEvent(testEvent, eventCallback)

    host.sendEvent(testEvent.createMsg())

    await later(0)

    t.true(eventCallback.calledOnce)
})

const loadWeight = 128

test.skip('loaded', async t => {
    const host = t.context.host
    const client = t.context.client

    const testEvents = []
    const eventCallbacks = []
    const randKey = Types.Key.Def().rand
    for (let index = 0; index < loadWeight; index++) {
        const eventType = Types.Object.Def({["test"+index]: "Test" + randKey() })
        testEvents.push(EventFactory(eventType))
        eventCallbacks.push(sinon.fake())
    }

    const start = Date.now()
    
    testEvents.forEach((testEvent , i) => host.onEvent(testEvent, eventCallbacks[i], "test"))

    for (let index = 0; index < loadWeight; index++) {
        testEvents.forEach(testEvent => client.sendEvent(testEvent.createMsg()))
        await later(0)
    }

    const end = Date.now()
    const delta = end - start

    console.log("loadWeight: ", loadWeight, delta + "ms", "processed events: " + eventCallbacks.reduce((sum, callback) => sum + callback.callCount, 0))

    t.true(eventCallbacks.every(callback => callback.called))
})

test('disconnection', async t => {
    const host = t.context.host
    const client = t.context.client

    const disconnectHostCallback = sinon.fake()
    host.onEvent(disconnectionEvent, disconnectHostCallback)

    t.false(disconnectHostCallback.called)

    client.disconnect()

    await later(1)

    t.true(disconnectHostCallback.calledOnce)
})