const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: Types.Key.Def(),
  role: Types.Key.Def(),
  uuid: Types.UUID.Def()
}, true)

module.exports = EventFactory(type)