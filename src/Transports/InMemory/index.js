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

        connectionPull.addConnection({ 
            id: this.id, 
            isHost: this.isHost, 
            callbacks: {
                connect: this.connectionCallback,
                receive: this.receive,
                disconnect: this.disconnectionCallback
            }
        })
    }

    send(msg) {
        connectionPull.send(this.id, this.isHost, msg)
    }

    disconnect() {
        connectionPull.deleteConnection(this.id, this.isHost)
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