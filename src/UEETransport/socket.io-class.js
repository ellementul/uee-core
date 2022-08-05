import { io } from "socket.io-client"
import { AbstractTransport } from "uee"

class SocketIOTransport extends AbstractTransport {
  constructor (url) {
    super();
    this.socket = io(url)
    this.send = this.send.bind(this)
    this.onRecieve = this.onRecieve.bind(this)
  }
  send (event) {
    this.socket.emit("sendEvent", event)
  } 
  onRecieve (recieveCallback) {
    this.socket.on("sendEvent", event => {
      recieveCallback(event)
    })
  } 
}

export default SocketIOTransport