class UEEModule {
  constructor (dispatcherEvents) {
    const events = this.defineListenerEvents()
    
    events.forEach(({ name }) => {
      if(typeof this[name] !== "function")
        throw new Error(`Callback don't define for this listenered event: ${ name }`)

      dispatcherEvents.defineListenerEvent({ name })
    });

    dispatcherEvents.onRecieveEvent(event => this.recieveEvent(event))
    this.sendEvent = event => dispatcherEvents.sendEvent(event)
  }

  recieveEvent ({ name, payload }) {
    this[name](payload)
  }
}

export default UEEModule