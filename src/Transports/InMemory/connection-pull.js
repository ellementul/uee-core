export class ConnectionPull extends Map {

    addConnection(id, isHost, cb) {

        if(isHost) {
            this.set(id, { host: { cb, out: [] } })
        }
        else {
            const connection = this.get(id)

            connection.client = { cb, out: [] }
        }
    }

    send(id, isHost, msg) {
        const connection = this.get(id)

        if(isHost)
            connection.host.out.push(msg)
        else
            connection.client.out.push(msg)

        if(!this.interval)
            this.run()
    }

    deleteConnection(id, isHost) {

        if(isHost) {
            this.delete(id)
        }
        else {
            const connection = this.get(id)
            connection.client = null
        }
    }

    run() {
        this.interval = setInterval(() => this.tick(), 0)
    }

    stop() {
        clearInterval(this.interval)
        this.interval = null
    }

    tick() {
        let isNeedStop = true

        for(const [id, connection] of this) {

            if(!connection.host || !connection.client)
                continue

            while(connection.host.out.length > 0) {
                connection.client.cb(connection.host.out.pop())
                isNeedStop &&= false
            }

            while(connection.client.out.length > 0) {
                connection.host.cb(connection.client.out.pop())
                isNeedStop &&= false
            }
        }

        if(isNeedStop)
            this.stop()
    }
}