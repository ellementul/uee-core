import { io } from "socket.io-client"
import AbstractTransport from "./abstract-class.js";


class SocketIoTransport extends AbstractTransport {
  constructor (uri) {
    super()

    this.socket = io(uri)
    this.recieveEvent = () => { throw new Error("The recieve callback isn't function!") }

    // Bind methods
    this.onRecieve = this.onRecieve.bind(this)
    this.send = this.send.bind(this)
  }

  onRecieve (recieveEvent) {
    if(typeof recieveEvent === "function")
      this.socket.on("sendEvent", event => {  
        recieveEvent(event) 
      })
    else
      throw new Error("The recieve callback isn't function!")
  }

  send (event) {
    this.socket.emit("sendEvent", event)
  }
}

export default SocketIoTransport