import { Server } from "socket.io"

class SocketIOServer {
  constructor(cors_origin, port) {
    const io = new Server(null, {
      cors: {  origin: cors_origin  }
    });

    io.on('connection', (socket) => {
      socket.on("sendEvent", event => {
        socket.broadcast.emit("sendEvent", event)
        socket.emit("sendEvent", event)
      })
    });

    io.listen(port, () => {
      console.log(`listening on *: ${port}`);
    });
  }
}

export default SocketIOServer