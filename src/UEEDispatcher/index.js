import { v4 as uuidv4 } from 'uuid'

export class UEEDispatcher {
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

    let signature = name

    if (payloadType || payload) {
      const { system, entity, action } = payloadType || payload

      if(system)
        signature += system

      if(action)
        signature += action

      if(entity)
        signature += entity
    }

    return signature
  }

  defineListenerEvent({ name, payloadType }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType })
    this.listenerEventsSignatures.set(eventSignature, {})
  }

  sendEvent({ name, payload }) {
    // const eventSignature =  this.calculateEventSignature({ name, payload })

    // if(!this.listenerEventsSignatures.has(eventSignature))
    //   this.listenerEventsSignatures.set(eventSignature, {})

    this.server.send({ name, payload })
    this.recieveEvent({ name, payload })
  }

  onRecieveEvent (eventCallback) {
    if(typeof eventCallback === "function")
      this.sendModules = eventCallback
    else
      throw new Error("The recieve callback isn't function!")
  }

  recieveEvent ({ name, payload }) {
    const eventSignature =  this.calculateEventSignature({ name, payload })
    const eventsParam = this.listenerEventsSignatures.get(eventSignature)

    if(eventsParam) {
      this.sendModules({ name, payload })
    }
  }
}