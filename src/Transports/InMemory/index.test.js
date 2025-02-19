import test from 'ava'
import sinon from "sinon"

import { InMemory } from './index.js'
import { EventFactory, Types } from '../../Event/index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}


test.before('constructor', t => {
    t.context.host = new InMemory({ id: "Test", isHost: true })
    t.context.client = new InMemory({ id: "Test", isHost: false })
})

test('connection', t => {
    const host = t.context.host
    const client = t.context.client

    const hostCallback = sinon.fake()
    host.onConnection(hostCallback)

    host.receiveCallback = sinon.fake()
    host.connect(host.receiveCallback)

    const clientCallback = sinon.fake()
    client.onConnection(clientCallback)

    client.receiveCallback = sinon.fake()
    client.connect(client.receiveCallback)

    t.true(hostCallback.called)
    t.true(clientCallback.called)
})

test('send', async t => {
    const host = t.context.host
    const client = t.context.client

    const msgToClient = { text: "MessageHost" }
    const msgToHost = { text: "MessageClient" }  
    
    host.send(msgToClient)
    client.send(msgToHost)

    await later(10)

    t.true(client.receiveCallback.calledWith(msgToClient))
    t.true(host.receiveCallback.calledWith(msgToHost))

    
})

// test('disconnection', t => {
//     const host = t.context.host
//     const client = t.context.client

    
// })