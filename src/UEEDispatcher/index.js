class UEEDispatcher {
  constructor () {
    this.listenerEventsSignatures = new Set
    this.recieveEvent = () => { throw new Error("The recieve callback isn't function!") }

    this.server = {
      send: () => {},
    }
  }

  connectServer ({ send, onRecieve }) {
    this.server.send = event => send(event)
    onRecieve( event => this.recieveEvent(event) )
  }

  calculateEventSignature ({ name, payloadType, payload }) {
    return name
  }

  defineListenerEvent({ name, payloadType }) {
    const eventSignature = this.calculateEventSignature({ name, payloadType })
    this.listenerEventsSignatures.add(eventSignature)
  }

  sendEvent({ name, payload }) {

    this.server.send({ name, payload })

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