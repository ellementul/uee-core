import sinon from "sinon"
import { assertLog, later, successfulColor } from './test.utils.js'

import { EventFactory, Types } from '../../Event/index.js'
import { PeerJsTransport } from './index.js'

export async function runTests() {
    const id = Types.UUID.Def().rand()

    console.log(`%c Peers Transport test is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: true, id })

    const url = new URL(location)
    url.pathname = "/test.client"
    url.searchParams.set("id", id)

    assertLog("Constructor", transport)

    document.body.insertAdjacentHTML("beforeend", `
        <a target="_blank" href="${url}">Ссылка на клиент</a>
    `)

    transport.onConnection(afterConnection)
    transport.onDisconnection(msg => assertLog("onDisconnectionHost", msg.isHost))

    let reciveCallback

    transport.connect(msg => reciveCallback(msg))


    async function afterConnection (msg) {
        const testMessage = "Test Msg" + Math.random()
        reciveCallback = msg => assertLog("First message", msg == testMessage)

        assertLog("onConnectionHost", msg.isHost)

        transport.send(testMessage)
    

        await later(100)

        const secondTestMessage = "Second Test Msg" + Math.random()
        reciveCallback = msg => assertLog("Second message", msg == secondTestMessage)

        transport.send(secondTestMessage)

        await later(100)

        transport.disconnect()
    }
}

