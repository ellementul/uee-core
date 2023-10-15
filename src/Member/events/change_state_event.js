import { EventFactory, Types } from '../../Event/index.js'

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: Types.Key.Def(),
  role: Types.Key.Def(),
  uuid: Types.UUID.Def()
}, true)

export default EventFactory(type)