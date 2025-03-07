import Types from '@ellementul/message-types'
import sha1 from 'sha1'

import { mergician } from './mergician.js'

function EventFactory(type) {
  if(!Types.isType(type))
    throw new TypeError("The type isn't type!")

  const callbacks = new Map
  const limits = new Map

  return {
    get type() {
      return type
    },

    get callbacksCount() {
      return callbacks.size
    },

    createMsg: function (payload, validation = false) {
      const msg = type.rand()
      payload = payload || {}

      const fullMsg = merge(msg, payload)

      if(validation) {
        const validError = this.getValidError(fullMsg)
        if(validError)
          throw new TypeError(`
            Invalid payload!
            Data: ${JSON.stringify({
              clearMsg: msg,
              customPayload: payload,
              validError
            }, null, 2)}
          `)
      }

      return fullMsg
    },

    toJSON: () => {
      return { type: type.toJSON() }
    },

    sign: () => {
      return sha1(type.toJSON(), 5)
    },

    isValid: (payload) => {
      if(typeof payload !== "object")
        return false

      return !type.test(payload)
    },

    getValidError: (payload) => {
      if(typeof payload !== "object")
        return 'Payload has to be object!!'

      return type.test(payload)
    },

    on: (id, callback, limit = -1) => {
      if(typeof callback !== "function")
        throw new TypeError("The recieve callback isn't function!")

      callbacks.set(id, callback)

      if(limit >= 0)
        limits.set(id, limit)
    },

    off: (id) => {
      callbacks.delete(id)
      limits.delete(id)
    },

    call: (payload) => {
      for (let [id, callback] of callbacks) {
        if(limits.has(id)) {
          if(limits.get(id) <= 0) {
            callbacks.delete(id)
            limits.delete(id)
            continue
          }
          else {
            limits.set(id, limits.get(id) - 1)
          }
        }

        callback(payload)
      }
    },
    
    clone: function() {
      return EventFactory(this.type)
    }
  }
}

const merge = mergician({
  beforeEach({ srcVal }) {
    if(Array.isArray(srcVal))
      return srcVal
  }
}) 

EventFactory.fromJSON = function (json) {
  if(typeof json == "string")
			json = JSON.parse(json)
  
  const type = Types.outJSON(json.type)
  return EventFactory(type)
}

export { EventFactory, Types }