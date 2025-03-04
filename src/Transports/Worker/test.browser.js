import sinon from "sinon"
import { assertLog, later, successfulColor } from './test.utils.js'

import { EventFactory, Types } from '../../Event/index.js'
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
    const loadWeight = 1024

    console.log(`%c Loading test is running, loadWeight: ${loadWeight}`, successfulColor + "; text-decoration:underline")

    const testEvents = []
    const messages = []
    const randKey = Types.Key.Def().rand
    for (let index = 0; index < loadWeight; index++) {
        const eventType = Types.Object.Def({["test"+index]: "Test" + randKey(), index: Types.Index.Def(loadWeight) })
        const event = EventFactory(eventType)
        testEvents.push(event)
        messages.push(event.createMsg({ index }))
    }

    let successfulCount = 0
    const reciveCallback = msg => testEvents[msg.index].isValid(msg) && successfulCount++

    const url = new URL('./test.client.js', import.meta.url)

    const transport = new WorkerTransport({ isHost: true, url })
    transport.onConnection(() => {})
    transport.onDisconnection(() => {})

    transport.connect(reciveCallback)

    const start = Date.now()

    messages.forEach(msg => transport.send(msg))

    await later(100)

    assertLog("Was get all messages", successfulCount == loadWeight)

    const end = Date.now()
    const delta = end - start

    console.log("loadWeight: ", loadWeight, delta + "ms")
}

