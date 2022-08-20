import { v4 as uuidv4 } from 'uuid'
export class UEEModule {

  constructor () {
    this.uuid = uuidv4()
    this.events = []
  }

  defEvents (events) {
    events.forEach(({ name }) => {
      if(typeof this[name] !== "function") throw new Error(`Callback don't define for this listenered event: ${ name }`)
    })

    this.events.push(...events)
  }

  setDispatcher (dispatcherEvents) {

    // TODO Abstract dispatcher instance check
    if(!dispatcherEvents || typeof dispatcherEvents !== "object")
      throw Error('Not valid dispatcher')

    //Get events waht is this module listener
    if(typeof this.defEvents !== 'function')
      throw new Error('The defEvents method should be define!')
    
    this.events.forEach(({ name, payloadType }) => {
      dispatcherEvents.defineListenerEvent({ name, payloadType })
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