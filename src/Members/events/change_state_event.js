const { EventFactory, Types } = require('../../Event')

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: Types.String.Def("\\w", 1024)
})

module.exports = EventFactory(type)