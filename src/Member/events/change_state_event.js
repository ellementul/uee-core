const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: Types.Key.Def()
}, true)

module.exports = EventFactory(type)