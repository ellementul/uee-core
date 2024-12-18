import Types from '@ellementul/message-types'
import getUuid from '@ellementul/uuid-by-string'

import { mergician } from './mergician.js'

function EventFactory(type, accessLvl) {
  if(!Types.isType(type))
    throw new TypeError("The type isn't type!")

  const callbacks = new Map
  const limits = new Map
  accessLvl = accessLvl || 0

  return {
    get type() {
      return type
    },

    get callbacksCount() {
      return callbacks.size
    },

    get accessLvl() {
      return accessLvl
    },

    createMsg: function (payload, validation = false) {
      const msg = type.rand()
      payload = payload || {}

      const fullMsg = {
        accessLvl,
        payload: merge(msg, payload)
      }

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
      return getUuid(type.toJSON(), 5)
    },

    isValid: ({ payload }) => {
      if(typeof payload !== "object")
        return false

      return !type.test(payload)
    },

    getValidError: ({ payload }) => {
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

    call: ({ payload }) => {
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
    
    clone: function(newAccessLvl) {
      if(newAccessLvl != null)
        return EventFactory(this.type, newAccessLvl)
      else
        return EventFactory(this.type, accessLvl)
    },

    decreaseAccessLvl() {
      return this.clone(this.accessLvl - 1)
    }
  }
}

function checkAccessLvl(msg) {
  return (typeof msg.accessLvl === "number" && msg.accessLvl > 0)
}

function decreaseAccessLvl(msg) {
  return {
    ...msg,
    accessLvl: msg.accessLvl - 1
  }
}

const merge = mergician({
  beforeEach({ depth, key, srcObj, srcVal, targetObj, targetVal }) {
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

export { EventFactory, checkAccessLvl, decreaseAccessLvl, Types }