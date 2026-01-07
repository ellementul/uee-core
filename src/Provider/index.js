import { EventPull } from "../EventPull/index.js"

class Provider {
  constructor () {
    this.listenerEvents = new Map
  }

  sendEvent(payload) {
      this.listenerEvents.forEach((event) => {
        if(event.isValid(payload))
          this.callEvent({ event, payload })
      })
  }

  onEvent(event, callback, id, limit = -1) {

    const signature = event.sign()
    
    if(!this.listenerEvents.has(signature))
      this.listenerEvents.set(signature, event.clone())

    this.listenerEvents.get(signature).on(id, callback, limit)
  }

  offEvent(event, id) {

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
}


class AsyncProvider {
  constructor () {
    this.listenerEvents = new Map

    this.setPull()
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

  onEvent(event, callback, id, limit = -1) {

    const signature = event.sign()
    
    if(!this.listenerEvents.has(signature))
      this.listenerEvents.set(signature, event.clone())

    this.listenerEvents.get(signature).on(id, callback, limit)
  }

  offEvent(event, id) {

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
}

export { AsyncProvider, Provider }