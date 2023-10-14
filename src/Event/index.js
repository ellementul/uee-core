import Types from '@ellementul/message-types'
import getUuid from '@ellementul/uuid-by-string'

function EventFactory(type) {
  if(!Types.isType(type))
    throw new TypeError("The type isn't type!")

  const callbacks = new Map
  const limits = new Map

  return {
    get type() {
      return type
    },
    create: () => {
      return type.rand()
    },
    toJSON: () => {
      return { type: type.toJSON() }
    },
    sign: () => {
      return getUuid(type.toJSON(), 5)
    },
    isValid: (payload) => {
      return !type.test(payload)
    },
    isValidError: (payload) => {
      return type.test(payload)
    },
    on: (id, callback, limit = -1) => {
      if(typeof callback === "function") {
        callbacks.set(id, callback)

        if(limit >= 0)
          limits.set(id, limit)
      }
      else {
        throw new TypeError("The recieve callback isn't function!")
      }
    },
    off: (id) => {
      callbacks.delete(id)
      limits.delete(id)
    },
    call: payload => {
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

EventFactory.fromJSON = function (json) {
  if(typeof json == "string")
			json = JSON.parse(json)
  
  const type = Types.outJSON(json.type)
  return EventFactory(type)
}

export { EventFactory, Types }