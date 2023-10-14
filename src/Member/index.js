import mergician from 'mergician'

const { Types } = require('../Event')
const connectedEvent = require('./events/connected_event')
const errorEvent = require('./events/error_event')

class Member {
  constructor() {
    this._uuid = Types.UUID.Def().rand()

    this._provider = null
    this._pre_init_events = []
    this._pre_init_messages = []

    this.listeningEvents = new Set

    this.onEvent = this.onEventInConstructor
    this.offEvent = this.offEventInConstructor
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

  onEventInConstructor(event, callback, limit = -1) {
    const signEvent = event.sign()

    if(this.listeningEvents.has(signEvent))
      throw new Error("Duplicated define callback for event! You can delete old callback via offEvent method and define new callback again")

    if(signEvent !== errorEvent.sign())
      callback = this.wrapCallback(callback)

    if(this._provider)
      this._provider.onEvent(event, callback, this.uuid, limit)
    else
      this._pre_init_events.push([event, callback, this.uuid, limit])

    this.listeningEvents.add(signEvent)
  }

  onEventInRuntime(event, callback, limit = 1) {
    const signEvent = event.sign()

    if(this.listeningEvents.has(signEvent))
      throw new Error

    if(signEvent !== errorEvent.sign())
      callback = this.wrapCallback(callback)

    this._provider.onEvent(event, callback, this.uuid, limit)
    this.listeningEvents.add(signEvent)
  }

  offEventInConstructor() {
    throw new Error("Only after setting provider!")
  }

  offEventInRuntime(event) {
    this.listeningEvents.delete(event.sign())
    this._provider.offEvent(event, this.uuid)
  }

  sendEvent(payload) {
    if(this._provider)
      this._provider.sendEvent(payload)
    else
      this._pre_init_messages.push(payload)
  }

  send(event, payload) {
    const signEvent = event.sign()

    if(this.listeningEvents.has(signEvent))
      console.warn("You send event what this member listens, it may be cycle in calls of one event!")

    const template = event.create()
    let full_message

    const merge = mergician({
      filter: ({ srcVal, targetVal }) => !(Array.isArray(srcVal) && Array.isArray(targetVal))
    }) 

    if(payload instanceof Object)
      full_message = merge(template, payload)
    else if(!payload)
      full_message = template
    else
      throw new Error("This function waits for second argument is object to merge with template. Please, use sendEvent method for other cases.")

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

    this.onEvent = this.onEventInRuntime
    this.offEvent = this.offEventInRuntime

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