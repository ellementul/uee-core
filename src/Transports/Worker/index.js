export function WorkerTransport(options) {
    return options.isHost ? new WorkerTransportHost(options) : new WorkerTransportClient(options)
}

const PING = "pingWorker"
const PONG = "pongWorker"
const DISCONNECT = "disconnectWorker"

class WorkerTransportHost {
    constructor({ url }) {
        this.url = url
        this.isHost = true
        this.isConnection = false        
    }

    async connect(cb) {
        if(typeof cb == "function")
            this.receiveCallback = cb
        else
            throw new TypeError()

        if(!this.worker)
            this.worker = new Worker(this.url, { type: "module"  })
        
        this.send = msg => this.worker.postMessage(msg)
        this.worker.onmessage = msg => this.receive(msg)
        this.worker.onerror = msg => this.disconnect(msg)

        this.send(PING)
    }

    receive(msg) {
        if(msg.data === PONG) {
            if(!this.isConnection)
                this.connectionCallback({ isHost: this.isHost })

            this.isConnection = true
            return
        }

        if(msg.data === DISCONNECT) {
            if(this.isConnection)
                this.disconnectionCallback({ isHost: this.isHost })

            this.isConnection = false
            return
        }

        if(this.isConnection)
            this.receiveCallback(msg.data)
        else
            throw new Error("I can't send msg when disconnection!!")
    }

    disconnect(finishMsg) {
        this.worker.terminate()
        this.disconnectionCallback({ isHost: this.isHost, finishMsg })
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

class WorkerTransportClient {
    constructor() {
        this.isHost = false        
    }

    connect(cb) {
        if(typeof cb == "function")
            this.receiveCallback = cb
        else
            throw new TypeError()

        this.send = msg => postMessage(msg)
        onmessage = msg => this.receive(msg)
    }

    receive(msg) {
        if(msg.data === PING) {
            if(!this.isConnection) {
                this.connectionCallback({ isHost: this.isHost })
                this.send(PONG)
            }

            this.isConnection = true
            return
        }

        this.receiveCallback(msg.data)
    }

    disconnect() {
        this.disconnectionCallback({ isHost: this.isHost })
        this.send(DISCONNECT)
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