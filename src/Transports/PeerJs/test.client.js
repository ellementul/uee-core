import sinon from "sinon"
import { assertLog, later, successfulColor } from './test.utils.js'

import { PeerJsTransport } from './index.js'

export async function runEchoClient() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id')

    console.log(`%c Peers Transport client is running with id: ${id}`, successfulColor + "; text-decoration:underline")

    const transport = new PeerJsTransport({ isHost: false, id })

    assertLog("Constructor", transport)

    transport.onConnection(msg => assertLog("onConnectionClient", !msg.isHost))
    transport.onDisconnection(msg => assertLog("onDisconnectionClient", !msg.isHost))

    transport.connect(msg => transport.send(msg))
}