import { Server } from "socket.io"
class UEEServer {
  constructor (server) {

    const io = new Server(server)
    io.on("connection", socket => this.connection(socket))
  }

  connection (socket) {
    console.log(socket.id);
  }
}

export default UEEServer