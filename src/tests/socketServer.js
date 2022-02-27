import { Server } from "socket.io"
class UEEServer {
  constructor (server) {

    const io = new Server(server)
    io.on("connection", socket => this.connection(socket))
  }

  connection (socket) {
    socket.on("sendEvent", event => { 
      socket.emit("sendEvent", event)
    })
  }
}

export default UEEServer