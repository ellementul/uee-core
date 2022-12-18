const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Logging",
  entity: "Error",
  state: 
  {
    name: Types.Key.Def(),
  }
}, true)

module.exports = EventFactory(type)