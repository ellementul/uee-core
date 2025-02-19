import { ConnectionPull } from "./connection-pull.js"


const connectionPull = new ConnectionPull

export class InMemory {
    constructor({ id, isHost }) {
        this.id = id
        this.isHost = isHost
    }

    connect(cb) {
        if(typeof cb == "function")
            this.receive = cb

        connectionPull.addConnection(this.id, this.isHost, this.receive)
        this.connectionCallback()
    }

    send(msg) {
        connectionPull.send(this.id, this.isHost, msg)
    }

    disconnect() {
        connectionPull.deleteConnection(this.id, this.isHost)
        this.disconnectionCallback()
    }

    onConnection(cb) {
        if(typeof cb == "function")
            this.connectionCallback = cb
        else
            throw new TypeError()
    }

    onDisconnection(cb) {
        if(typeof cb == "function")
            this.disconnectionCallback = cb
        else
            throw new TypeError()
    }
}