export class TestTransport {
    constructor(Transport, options, ...args) {
        this.transport = new Transport(options, ...args)
    }

    connect(cb) {
        this.transport.connect(cb)
    }

    send(msg) {
        this.transport.send(msg)
    }

    disconnect() {
        this.transport.disconnect()
    }

    onConnection(cb) {
        this.transport.onConnection(cb)
    }

    onDisconnection(cb) {
        this.transport.onDisconnection(cb)
    }
}