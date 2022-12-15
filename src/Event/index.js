const Types = require('typesjs')
const CRC32 = require('crc-32')

function EventFactory(type) {
  if(!Types.isType(type))
    throw new Error("The type isn't type!")

  const callbacks = new Set

  return {
    sign: () => {
      return CRC32.str(type.toJSON())
    },
    isValid: (payload) => {
      return !type.test(payload)
    },
    on: callback => {
      if(typeof callback === "function")
        callbacks.add(callback)
      else
        throw new Error("The recieve callback isn't function!")
    },
    call: payload => {
      for (let callback of callbacks) {
        callback(payload)
      }
    }
  }
}

module.exports = { EventFactory, Types }