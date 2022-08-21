import { v4 as uuidv4 } from 'uuid'
export class UEEModule {

  constructor () {
    this.uuid = uuidv4()
    this.events = []
    this.callbacks = []

    this.sendEvent = () => { throw new Error(`This module with uuid: ${this.uuid} don't have defined dispatcher!`) }
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
    
    this.events.forEach(({ name, payloadType }) => {
      dispatcherEvents.defineListenerEvent({ name, payloadType })
    });

    this._dispatcher = dispatcherEvents

    dispatcherEvents.onRecieveEvent(event => this.recieveEvent(event))
    this.sendEvent = event => dispatcherEvents.sendEvent(event)
  }

  defEventNow ({ name, payloadType }, callback) {

    if(!this._dispatcher)
      this.events.push({ name, payloadType })
    else
      this._dispatcher.defineListenerEvent({ name, payloadType })

    this.callbacks[name] = env => callback(env)
  }

  recieveEvent ({ name, payload }) {
    try {
      typeof this[name] == "function" ? this[name](payload) : this.callbacks[name]()
    }
    catch (error) {

      if(typeof this[name] !== "function")
        throw new Error(`Callback don't define for this listenered event: ${ name }`)

      error.message = `The error of calling callback for '${name}' event : ${error.message}`
      throw error
    }
  }
}