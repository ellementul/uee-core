import sinon from "sinon"

import { WorkerTransport } from './index.js'
import { EventFactory, Types } from '../../Event/index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

const successfulColor = 'color:rgb(39, 170, 57)'
const warnfulColor = 'color:rgb(161, 170, 39)'
const failColor = 'color:rgb(170, 70, 39)'

const assertLog = (title, isSuccessful) => console.log(`%c ${title}: ${!!isSuccessful}`, isSuccessful ? successfulColor : failColor)

export async function runTests() {
    console.log('%c Worker Transport test is running', successfulColor + "; text-decoration:underline")

    const url = new URL('./test.client.js', import.meta.url)

    const transport = new WorkerTransport({ isHost: true, url })

    assertLog("Constructor", transport)

    transport.onConnection(msg => assertLog("onConnectionHost", msg.isHost))
    transport.onDisconnection(console.log)

    transport.connect(console.log)
}

