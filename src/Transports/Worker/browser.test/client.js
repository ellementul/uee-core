import { WorkerTransport } from '../index.js'
import { assertLog } from './test.utils.js'

const transport = new WorkerTransport({ isHost: false })

transport.onConnection(msg => assertLog("onConnectionClient", !msg.isHost))

transport.onDisconnection(msg => assertLog("onDisconnectionClient", !msg.isHost))

transport.connect(msg => transport.send(msg))