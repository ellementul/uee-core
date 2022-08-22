import { v4 as uuidv4 } from 'uuid'

export function checkToBeValidEvent({ name, payloadType, tags }) {

  if(!name)
    throw new Error('Event name is undefined!')

  if(tags && !payloadType)
    throw new Error('Event payloadType is undefined when tags is defind!')

  if(Array.isArray(tags) && tags.length > 0) {
    tags.forEach(tag => {
      if(!payloadType[tag])
        throw new Error(`Invalidate event: tag ${tag} isn't found in event data ${JSON.stringify(payloadType)}`)
    })
  }
}

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

  calculateEventSignature ({ name, payloadType, payload, tags = [] }) {

    const signatures = [name]
    const data = payloadType || payload

    if(tags.length > 0) {
      tags.forEach(tag => {
        if(!data[tag])
          throw new Error(`Invalidate event: tag ${tag} isn't found in event data ${JSON.stringify(payloadType)}`)
        
        signatures.push(data[tag])
      })
    }

    return signatures.join(':')
  }

  defineListenerEvent({ name, payloadType, tags }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType, tags })
    this.listenerEventsSignatures.set(eventSignature, {})
  }

  sendEvent({ name, payload }) {
    // const eventSignature =  this.calculateEventSignature({ name, payload })

    // if(!this.listenerEventsSignatures.has(eventSignature))
    //   this.listenerEventsSignatures.set(eventSignature, {})

    this.server.send({ name, payload, tags })
    this.recieveEvent({ name, payload, tags })
  }

  onRecieveEvent (eventCallback) {
    if(typeof eventCallback === "function")
      this.sendModules = eventCallback
    else
      throw new Error("The recieve callback isn't function!")
  }

  recieveEvent ({ name, payload, tags }) {
    const eventSignature =  this.calculateEventSignature({ name, payload, tags })
    const eventsParam = this.listenerEventsSignatures.get(eventSignature)

    if(eventsParam) {
      this.sendModules({ name, payload, tags })
    }
  }
}