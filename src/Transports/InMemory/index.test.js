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

    host.connectCallback = sinon.fake()
    host.onConnection(host.connectCallback)
    host.onDisconnection(host.connectCallback)

    host.receiveCallback = sinon.fake()
    host.connect(host.receiveCallback)

    client.connectCallback = sinon.fake()
    client.onConnection(client.connectCallback)
    client.onDisconnection(client.connectCallback)

    client.receiveCallback = sinon.fake()

    t.false(client.connectCallback.called)
    t.false(host.connectCallback.called)

    client.connect(client.receiveCallback)

    t.true(host.connectCallback.called)
    t.true(client.connectCallback.called)
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

test('disconnection', t => {
    const host = t.context.host
    const client = t.context.client

    t.true(host.connectCallback.calledOnce)
    t.true(client.connectCallback.calledOnce)

    client.disconnect()

    t.is(host.connectCallback.getCalls().length, 2)
    t.is(client.connectCallback.getCalls().length, 2)

    host.disconnect()

    t.is(host.connectCallback.getCalls().length, 2)
    t.is(client.connectCallback.getCalls().length, 2)
})