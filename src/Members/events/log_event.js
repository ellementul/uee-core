const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Logging",
  entity: Types.Key.Def()
})

module.exports = EventFactory(type)