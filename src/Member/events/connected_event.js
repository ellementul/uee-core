import { EventFactory, Types } from '../../Event/index.js'

const type = Types.Object.Def({
  system: "Cooperation",
  entity: "Member",
  state: "Connected",
  role: Types.Key.Def(),
  uuid: Types.UUID.Def()
})

export default EventFactory(type)