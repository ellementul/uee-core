import { EventFactory, Types } from '../../Event/index.js'

const type = Types.Object.Def({
  system: "Logging",
  entity: Types.Key.Def()
}, true)

export default EventFactory(type)