import { Peer } from "peerjs"

export class PeerJsTransport {
    constructor({ id, isHost, options }) {
        this.isHost = isHost
        this.id = !isHost && id
        
        this.peer = new Peer(isHost && id, options)
    }

    connect(cb) {
        if(typeof cb == "function")
            this.receiveCallback = cb
        else
            throw new TypeError()

        if(this.isHost)
            this.peer.on("connection", conn => this.afterConnection(conn))
        else
            setTimeout(()=> {
                const conn = this.peer.connect(this.id)
                this.afterConnection(conn)
            }, 1000)
    }

    afterConnection(conn) {
        conn.on("open", (id) => {
            this.connectionCallback({ isHost: this.isHost })
        })

        conn.on("data", (data) => {
            this.receiveCallback(data)
        })

        conn.on("close", () => {
            this.disconnectionCallback({ isHost: this.isHost })
        })

        this.send = msg => conn.send(msg)

        this.disconnect = () => {
            conn.close()
            this.disconnectionCallback({ isHost: this.isHost })
        }
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