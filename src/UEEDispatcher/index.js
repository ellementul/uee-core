import { v4 as uuidv4 } from 'uuid'

class UEEDispatcher {
  constructor () {
    this.uuid = uuidv4()

    this.listenerEventsSignatures = new Map
    this.sendModules = () => { throw new Error("The recieve callback isn't function!") }

    this.server = {
      send: () => {},
    }
  }

  connectServer (server) {
    server.onRecieve( event => {
      if(event.from === this.uuid)
        return
        
      this.recieveEvent(event) 
    })

    this.server.send = event => {
      event.from = this.uuid 
      server.send(event)
    }
  }

  calculateEventSignature ({ name, payloadType, payload }) {
    return name
  }

  defineListenerEvent({ name, payloadType }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType })
    this.listenerEventsSignatures.set(eventSignature, { recieveLastVersion: 0, sendLastVersion: 0 })
  }

  sendEvent({ name, payload }) {
    const eventSignature =  this.calculateEventSignature({ name, payload })

    if(!this.listenerEventsSignatures.has(eventSignature))
      this.listenerEventsSignatures.set(eventSignature, { recieveLastVersion: 0, sendLastVersion: 0 })

    const eventsParam = this.listenerEventsSignatures.get(eventSignature)

    const version = eventsParam.sendLastVersion = eventsParam.sendLastVersion + 1

    this.server.send({ name, payload, version })
    this.recieveEvent({ name, payload, version })
  }

  onRecieveEvent (eventCallback) {
    if(typeof eventCallback === "function")
      this.sendModules = eventCallback
    else
      throw new Error("The recieve callback isn't function!")
  }

  recieveEvent ({ name, payload, version }) {
    const eventSignature =  this.calculateEventSignature({ name, payload })
    const eventsParam = this.listenerEventsSignatures.get(eventSignature)

    // We don't need old version or unlistenered event
    if(eventsParam && version > eventsParam.recieveLastVersion) {
      eventsParam.recieveLastVersion = version
      this.sendModules({ name, payload })
    }
  }
}

export default UEEDispatcher