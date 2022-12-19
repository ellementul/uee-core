const { Provider } = require("../Provider/index.js")
const connectedEvent = require('./events/connected_event')
const errorEvent = require('./events/error_event')

class Member {
  constructor() {
    this._provider = null
    this._pre_init_events = []
    this._pre_init_messages = []
  }

  wrapCallback(callback) {
    return payload => {
      try {
        callback(payload)
      } catch (error) {
        if(error instanceof Error)
          this.send(errorEvent, {
            state: {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          })
        else
          throw error
      }
    }
  }

  onEvent(event, callback) {
    if(event.sign() !== errorEvent.sign())
      callback = this.wrapCallback(callback)

    if(this._provider)
      this._provider.onEvent(event, callback)
    else
      this._pre_init_events.push([event, callback])
  }

  sendEvent(payload) {
    if(this._provider)
      this._provider.sendEvent(payload)
    else
      this._pre_init_messages.push(payload)
  }

  send(event, payload) {
    const message = event.create()
    let full_message

    if(payload instanceof Object || Array.isArray(payload))
      full_message = {
        ...message,
        ...payload
      }
    else
      full_message = payload || message

    if(!event.isValid(full_message))
      throw `Invalid payload! Full message: ${JSON.stringify(full_message)}`

    this.sendEvent(full_message)
  }

  setProvider(provider) {
    if(!(provider instanceof Provider))
      throw "The provider ins't instance of Provider class"

    this._provider = provider

    this._pre_init_events.forEach(params => {
      this._provider.onEvent(...params)
    })
    this._pre_init_events = []

    this._pre_init_messages.forEach(payload => {
      this._provider.sendEvent(payload)
    })
    this._pre_init_messages = []

    this.send(connectedEvent)
  }
}

module.exports = { Member } 