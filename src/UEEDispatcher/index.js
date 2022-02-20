class UEEDispatcher {
  constructor () {
    this.listenerEventsSignatures = new Set
    this.recieveEvent = () => { throw new Error("The recieve callback isn't function!") }
  }

  calculateEventSignature ({ name, payloadType, payload }) {
    return name
  }

  defineListenerEvent({ name, payloadType }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType })
    this.listenerEventsSignatures.add(eventSignature)
  }

  sendEvent({ name, payload }) {
    const eventSignature =  this.calculateEventSignature({ name, payload })
    if(this.listenerEventsSignatures.has(eventSignature))
      this.recieveEvent({ name, payload })
  }

  onRecieveEvent(recieveEvent) {
    if(typeof recieveEvent === "function")
      this.recieveEvent = recieveEvent
    else
      throw new Error("The recieve callback isn't function!")
  }
}

export default UEEDispatcher