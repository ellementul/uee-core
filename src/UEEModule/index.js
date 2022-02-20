class UEEModule {
  constructor (dispatcherEvents) {
    const events = this.defineListenerEvents()
    
    events.forEach(({ name }) => {
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