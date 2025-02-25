export class ConnectionPull extends Map {

    addConnection({ 
        id, 
        isHost,
        callbacks: {
            connect,
            receive,
            disconnect
        }
    }) {

        if(isHost) {
            this.set(id, { 
                host: { 
                    callbacks: {
                        connect,
                        receive,
                        disconnect
                    }, 
                    out: [] 
                },
                isConnection: false 
            })
        }
        else {
            const connection = this.get(id)

            connection.client = { 
                callbacks: {
                    connect,
                    receive,
                    disconnect
                }, 
                out: [] 
            }

            connection.isConnection = true
            connection.host.callbacks.connect({ isHost: true })
            connection.client.callbacks.connect({ isHost: false })
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
        const connection = this.get(id)

        if(!connection)
            return

        if(connection.isConnection) {
            connection.isConnection = false

            connection.client.callbacks.disconnect({ isHost: false })
            connection.host.callbacks.disconnect({ isHost: true })
        }

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
                connection.client.callbacks.receive(connection.host.out.pop())
                isNeedStop &&= false
            }

            while(connection.client.out.length > 0) {
                connection.host.callbacks.receive(connection.client.out.pop())
                isNeedStop &&= false
            }
        }

        if(isNeedStop)
            this.stop()
    }
}