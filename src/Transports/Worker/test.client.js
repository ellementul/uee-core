import { WorkerTransport } from './index.js'

const successfulColor = 'color:rgb(39, 170, 57)'
const warnfulColor = 'color:rgb(161, 170, 39)'
const failColor = 'color:rgb(170, 70, 39)'

const assertLog = (title, isSuccessful) => console.log(`%c ${title}: ${!!isSuccessful}`, isSuccessful ? successfulColor : failColor)

const transport = new WorkerTransport({ isHost: false })

transport.onConnection(msg => assertLog("onConnectionClient", !msg.isHost))

transport.onDisconnection(msg => console.log("onDisconnection", msg))
transport.connect(msg => console.log("connect", msg))