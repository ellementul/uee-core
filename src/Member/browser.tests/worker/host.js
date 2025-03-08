import sinon from "sinon"

import { assertLog, later, successfulColor } from './test.utils.js'

import { EventFactory, Types } from '../../../Event/index.js'
import { MemberFactory } from '../../index.js'
import { WorkerTransport } from '../../../Transports/Worker/index.js'
import { connectionEvent } from "../../../Provider/events.js"

export async function runTests() {
    console.log('%c Worker Transport test is running', successfulColor + "; text-decoration:underline")

    const room = new MemberFactory
    const url = new URL('./client.js', import.meta.url)
    const transport = new WorkerTransport({ isHost: true, url })
    room.makeRoom({ transport: transport })
    room.connect()

    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const secondEvent = EventFactory(Types.Object.Def({ system: "test2" }))
    const callback = sinon.fake()

    room.subscribe(secondEvent, callback)

    room.subscribe(connectionEvent, () => {
        assertLog("Host send message", true)
        room.send(event)
    })

    await later(100)

    assertLog("Host got message", callback.called)
}