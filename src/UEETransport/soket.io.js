import { io } from "socket.io-client"
import AbstractTransport from "./abstract-class.js";

class SocketIoTransport extends AbstractTransport {
  constructor () {
    const socket = io("http://localhost:8080")
  }
}

export default SocketIoTransport