import { Types } from "../Event/index.js"
import { EventPull } from "../EventPull/index.js"
import { connectionEvent, disconnectionEvent } from "./events.js"

class Provider {
  constructor ({ transport, idMember } = {}) {
    this.listenerEvents = new Map

    this.id = idMember || Types.UUID.Def().rand()

    this.setPull()
      
    if(transport)
      this.setTransport(transport)
  }

  setPull() {
    this.isTransport = false

    this.pull = new EventPull(this.callEvent)

    this.sendEvent = function (payload) {

      this.listenerEvents.forEach((event) => {
        if(event.isValid(payload))
          this.pull.push({ event, payload })
      })
    }
  }

  setTransport(transport) {
    this.isTransport = true
    this.readyConnection = false

    transport.onConnection(result => this.connectEvent(result))
    transport.onDisconnection(result => this.disconnectEvent(result))

    this.sendEvent = function (payload) {

      if(this.readyConnection)
        transport.send(payload)

      this.listenerEvents.forEach((event) => {
        if(event.isValid(payload))
          this.pull.push({ event, payload })
      })
    }

    this.connect = function () {
      transport.connect(msg => this.receiveFromTransport(msg))
    }

    this.disconnect = function () {
      transport.disconnect()
    }
  }

  onEvent(event, callback, id, limit = -1) {

    id = id || this.id

    const signature = event.sign()
    
    if(!this.listenerEvents.has(signature))
      this.listenerEvents.set(signature, event.clone())

    this.listenerEvents.get(signature).on(id, callback, limit)
  }

  offEvent(event, id) {

    id = id || this.id

    const signature = event.sign()
    
    if(!this.listenerEvents.has(signature))
      return

    this.listenerEvents.get(signature).off(id)

    if(this.listenerEvents.get(signature).callbacksCount === 0)
      this.listenerEvents.delete(signature)
  }

  callEvent({ event, payload }){
    event.call(payload)
  }

  connectEvent({ isHost }) {
    this.readyConnection = true
    setTimeout(() => this.receiveFromTransport(connectionEvent.createMsg({ isHost })), 0)
  }

  disconnectEvent({ isHost }) {
    this.readyConnection = false
    setTimeout(() => this.receiveFromTransport(disconnectionEvent.createMsg({ isHost })), 0)
  }

  receiveFromTransport(payload){
    this.listenerEvents.forEach((event) => {
      if(event.isValid(payload))
        event.call(payload)
    })
  }
}

export { Provider }