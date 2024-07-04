import Types from '@ellementul/message-types'

const getUuid = Types.UUID.Def().rand

class Provider {
  constructor () {
    this.listenerEvents = new Map
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

  sendEvent(payload) {
    this.listenerEvents.forEach((event) => {
      if(event.isValid(payload))
        event.call(payload)
    })
  }
}

export { Provider }