class UEEModule {
  constructor (dispatcherEvents) {
    
    //Get name module
    this.name = this.constructor.name

    //Get events waht is this module listener
    let events = this. events || []
    if(typeof this.defEvents === 'function')
      events = this.defEvents()
    
    events.forEach(({ name }) => {
      if(typeof this[name] !== "function")
        throw new Error(`Callback don't define for this listenered event: ${ name }`)

      dispatcherEvents.defineListenerEvent({ name })
    });

    dispatcherEvents.onRecieveEvent(event => this.recieveEvent(event))
    this.sendEvent = event => dispatcherEvents.sendEvent(event)
  }

  recieveEvent ({ name, payload }) {
    try {
      this[name](payload)
    }
    catch (error) {

      if(typeof this[name] !== "function")
        throw new Error(`Callback don't define for this listenered event: ${ name }`)

      error.message = `The error of calling callback for '${name}' event : ${error.message}`
      throw error
    }
  }
}

export default UEEModule