const { v4: uuidv4 } = require('uuid')
class BaseMember {

  constructor () {
    this.uuid = uuidv4()
    this._events = []
    this._callbacks = []

    this.sendEvent = () => { throw new Error(`This module with uuid: ${this.uuid} don't have defined dispatcher!`) }
  }

  setDispatcher (provider) {
    if(!this.type)
      throw new Error(`The type module isn't defined!`)

    if(!provider || typeof provider !== "object")
      throw Error('Not valid provider')
    
    this._events.forEach(({ name, payloadType, tags }) => {
      provider.defineListenerEvent({ name, payloadType, tags })
    });

    this._dispatcher = provider

    provider.onRecieveEvent(event => this.recieveEvent(event))
    this.sendEvent = event => provider.sendEvent(event)
  }

  defEventWithoutCallback({ name, payloadType, tags }) {
    if(!this._dispatcher)
      this._events.push({ name, payloadType, tags })
    else
      this._dispatcher.defineListenerEvent({ name, payloadType, tags })
  }

  defEventNow ({ event: { name, payloadType, tags }, callback }) {
    this.defEventWithoutCallback({ name, payloadType, tags })
    this._callbacks[name] = payload => callback(payload)
  }

  defEvents (events) {
    events.forEach((event) => {
      if(typeof this[event.name] !== "function") 
        throw new Error(`Callback don't define for this listenered event: ${ event.name }`)

      const callback = payload => this[event.name](payload)
      this.defEventNow({ event, callback })
    })
  }

  recieveEvent ({ name, payload }) {
    try {
      this._callbacks[name](payload)
    }
    catch (error) {

      if(typeof this[name] !== "function" && typeof this._callbacks[name] !== "function")
        throw new Error(`Callback don't define for this listenered event: ${ name }`)

      error.message = `The error of calling callback for '${name}' event : ${error.message}`
      throw error
    }
  }
}

module.exports = { BaseMember }