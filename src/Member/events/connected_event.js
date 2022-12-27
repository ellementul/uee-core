const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: "Connected",
  role: Types.Key.Def()
})

module.exports = EventFactory(type)