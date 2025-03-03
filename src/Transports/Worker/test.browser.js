import sinon from "sinon"

import { assertLog, later, successfulColor } from './test.utils.js'

import { WorkerTransport } from './index.js'

export async function runTests() {
    console.log('%c Worker Transport test is running', successfulColor + "; text-decoration:underline")

    const url = new URL('./test.client.js', import.meta.url)

    const transport = new WorkerTransport({ isHost: true, url })

    assertLog("Constructor", transport)

    transport.onConnection(msg => assertLog("onConnectionHost", msg.isHost))
    transport.onDisconnection(msg => assertLog("onDisconnectionHost", msg.isHost))

    const testMessage = "Test Msg" + Math.random()
    let reciveCallback = msg => assertLog("First message", msg == testMessage)

    transport.connect(msg => reciveCallback(msg))
    transport.send(testMessage)

    await later(100)

    const secondTestMessage = "Second Test Msg" + Math.random()
    reciveCallback = msg => assertLog("Second message", msg == secondTestMessage)

    transport.send(secondTestMessage)

    await later(100)

    transport.disconnect()
}

export async function loadingTests() {
    console.log('%c Loading test is running', successfulColor + "; text-decoration:underline")

    const url = new URL('./test.client.js', import.meta.url)

    const transport = new WorkerTransport({ isHost: true, url })

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

}

