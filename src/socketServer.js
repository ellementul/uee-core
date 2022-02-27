import { Server } from "socket.io"


const io = new Server()
io.on("connection", socket => connection(socket))
io.listen(3000)

function connection (socket) {
  socket.on("sendEvent", event => { 
    socket.emit("sendEvent", event)
  })
}
