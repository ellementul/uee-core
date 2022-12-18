const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Logging",
  entity: Types.Key.Def()
}, true)

module.exports = EventFactory(type)