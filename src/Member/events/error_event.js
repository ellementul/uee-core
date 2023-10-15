import { EventFactory, Types } from '../../Event/index.js'

const type = Types.Object.Def({
  system: "Logging",
  entity: "Error",
  state: 
  {
    name: Types.Key.Def(),
  }
}, true)

export default EventFactory(type)