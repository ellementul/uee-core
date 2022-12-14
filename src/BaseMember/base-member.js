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
    for (let callback_name in events) {
      if(typeof this[callback_name] !== "function") 
        throw new Error(`Callback don't define for this listenered event: ${ callback_name }`)

      const callback = payload => this[callback_name](payload)
      const event = events[callback_name]
      this.defEventNow({ event, callback })
    }
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