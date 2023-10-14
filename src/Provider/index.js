import Types from '@ellementul/message-types'

const getUuid = Types.UUID.Def().rand

class Provider {
  constructor () {
    this.uuid = getUuid()

    this._listenerEvents = new Map
    this._logging = null
  }

  setTransport (transport) {
    transport.onRecieve( event => {
      if(event.from === this.uuid)
        return
        
      this.recieveEvent(event.data) 
    })

    this.sendTransport = event => {
      transport.send({
        data: event,
        from: this.uuid
      })
    }
  }

  onEvent(event, callback, id, limit = -1) {
    id = id || callback
    const signature = event.sign()
    
    if(!this._listenerEvents.has(signature))
      this._listenerEvents.set(signature, event.clone())

    this._listenerEvents.get(signature).on(id, callback, limit)
  }

  offEvent(event, id) {
    const signature = event.sign()
    
    if(!this._listenerEvents.has(signature))
      return

    this._listenerEvents.get(signature).off(id)
  }

  sendEvent(payload) {
    const isLocal = payload.access == "Local"

    if(!isLocal && this.sendTransport)
      this.sendTransport(payload)

    this.recieveEvent(payload)
  }

  recieveEvent (payload) {
    this.log(payload)

    this._listenerEvents.forEach((event, sign) => {
      if(event.isValid(payload))
        event.call(payload)
    })
  }

  setLogging(logging) {
    if(typeof logging === "function")
      this._logging = logging
    else
      throw new TypeError("The recieve logging callback isn't function!")
  }

  log (payload) {
    if(this._logging) {
      let events = new Map

      this._listenerEvents.forEach((event, sign) => {
        if(event.isValid(payload))
          events.set(sign, event.toJSON())
      })

      this._logging({ message: payload, triggeredEvents: events })
    }
  }
}

export { Provider }