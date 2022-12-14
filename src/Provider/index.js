const { v4: uuidv4 } = require('uuid')

function checkToBeValidEvent({ name, payloadType, tags }) {

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

class Provider {
  constructor () {
    this.uuid = uuidv4()

    this.listenerEventsSignatures = new Set
    this.sendModules = () => { throw new Error("The recieve callback isn't function!") }

    this._transport = false
  }

  setTransport (transport) {
    transport.onRecieve( event => {
      if(event.from === this.uuid)
        return
        
      this.recieveEvent(event) 
    })

    this.sendToTransport = event => {
      event.from = this.uuid 
      transport.send(event)
    }
  }

  calculateEventSignature ({ name, payloadType, payload, tags = [] }) {

    const signatures = [name]
    const data = payloadType || payload

    if(tags.length > 0) {
      const sortedTags = tags.sort() 
      sortedTags.forEach(tag => {
        if(!data[tag])
          throw new Error(`Invalidate event: tag ${tag} isn't found in event data ${JSON.stringify(payloadType)}`)
        
        signatures.push(`${tag}:${data[tag]}`)
      })
    }

    return signatures.join(';')
  }

  defineListenerEvent({ name, payloadType, tags }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType, tags })
    this.listenerEventsSignatures.add(eventSignature)
  }

  sendEvent(event) {
    if(this.sendToTransport)
      this.sendToTransport(event)

    this.recieveEvent(event)
  }

  onRecieveEvent (eventCallback) {
    if(typeof eventCallback === "function")
      this.sendModules = eventCallback
    else
      throw new Error("The recieve callback isn't function!")
  }

  recieveEvent ({ name, payload, tags }) {
    const eventSignature =  this.calculateEventSignature({ name, payload, tags })

    if(this.listenerEventsSignatures.has(eventSignature))
      this.sendModules({ name, payload, tags })
  }
}

module.exports = { Provider, checkToBeValidEvent }