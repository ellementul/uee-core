const { Provider } = require("../Provider/index.js")

class Member {
  constructor() {
    this._provider = null
    this._pre_init_events = []
    this._pre_init_messages = []
  }

  onEvent(event, callback) {
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
    const full_message = {
      ...message,
      ...payload
    }

    if(!event.isValid(full_message))
      throw "Invalid payload!"

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
  }
}

module.exports = { Member } 