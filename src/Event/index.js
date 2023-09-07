const Types = require('@ellementul/message-types')
const getUuid = require('uuid-by-string');

function EventFactory(type) {
  if(!Types.isType(type))
    throw new TypeError("The type isn't type!")

  const callbacks = new Map

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
    on: (id, callback) => {
      if(typeof callback === "function")
        callbacks.set(id, callback)
      else
        throw new TypeError("The recieve callback isn't function!")
    },
    off: (id) => {
      callbacks.delete(id)
    },
    call: payload => {
      for (let [_, callback] of callbacks) {
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

module.exports = { EventFactory, Types }