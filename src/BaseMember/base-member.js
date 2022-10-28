const { v4: uuidv4 } = require('uuid')
class BaseMember {

  constructor () {
    this.uuid = uuidv4()
    this._events = []
    this._callbacks = []

    this.sendEvent = () => { throw new Error(`This module with uuid: ${this.uuid} don't have defined dispatcher!`) }
  }

  defEvents (events) {
    events.forEach(({ name }) => {
      if(typeof this[name] !== "function") 
        throw new Error(`Callback don't define for this listenered event: ${ name }`)
    })

    this._events.push(...events)
  }

  setDispatcher (dispatcherEvents) {
    if(!this.type)
      throw new Error(`The type module isn't defined!`)

    if(!dispatcherEvents || typeof dispatcherEvents !== "object")
      throw Error('Not valid dispatcher')
    
    this._events.forEach(({ name, payloadType, tags }) => {
      dispatcherEvents.defineListenerEvent({ name, payloadType, tags })
    });

    this._dispatcher = dispatcherEvents

    dispatcherEvents.onRecieveEvent(event => this.recieveEvent(event))
    this.sendEvent = event => dispatcherEvents.sendEvent(event)
  }

  defEventNow ({ event: { name, payloadType, tags }, callback }) {

    if(!this._dispatcher)
      this._events.push({ name, payloadType, tags })
    else
      this._dispatcher.defineListenerEvent({ name, payloadType, tags })

    this._callbacks[name] = payload => callback(payload)
  }

  recieveEvent ({ name, payload }) {
    try {
      if(typeof this._callbacks[name] == "function") {
        this._callbacks[name](payload)

        if(typeof this[name] == "function") {
          this[name](payload)
        }
      }
      else {
        this[name](payload)
      }
      
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