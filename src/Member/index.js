const merge = require('deepmerge')

const { Types } = require('../Event')
const connectedEvent = require('./events/connected_event')
const errorEvent = require('./events/error_event')

class Member {
  constructor() {
    this._provider = null
    this._pre_init_events = []
    this._pre_init_messages = []
    this._uuid = Types.UUID.Def().rand()
  }

  get uuid() {
    return this._uuid
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
    const template = event.create()
    let full_message

    if(payload instanceof Object)
      full_message = merge(template, payload)
    else
      throw new Error("This function waits object to merge it with template. Please, use sendEvent method for other cases.")

    const validError = event.isValidError(full_message)
    if(validError)
      throw new TypeError(`
        Invalid payload!
        Data: ${JSON.stringify({
          validError,
          template,
          payload
        }, null, 2)}
      `)

    this.sendEvent(full_message)
  }

  setProvider(provider) {
    this._provider = provider

    this._pre_init_events.forEach(params => {
      this._provider.onEvent(...params)
    })
    this._pre_init_events = []

    this._pre_init_messages.forEach(payload => {
      this._provider.sendEvent(payload)
    })
    this._pre_init_messages = []

    this.send(connectedEvent, {
      role: this.getRole(),
      uuid: this._uuid
    })
  }

  getRole() {
    return this.role || "MemberWithoutRole"
  }
}

module.exports = { Member } 