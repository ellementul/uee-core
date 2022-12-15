const { v4: uuidv4 } = require('uuid')

class Provider {
  constructor () {
    this.uuid = uuidv4()

    this._listenerEvents = new Map
    this.sendModules = () => { throw new Error("The recieve callback isn't function!") }
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

  onEvent(event, callback) {
    const signature = event.sign()
    
    if(!this._listenerEvents.has(signature))
      this._listenerEvents.set(signature, event)

    event.on(callback)
  }

  sendEvent(payload) {
    if(this.sendTransport)
      this.sendTransport(payload)

    this.recieveEvent(payload)
  }

  recieveEvent (payload) {
    this._listenerEvents.forEach((event, sign) => {
      if(event.isValid(payload))
        event.call(payload)
    })
  }
}

module.exports = { Provider }