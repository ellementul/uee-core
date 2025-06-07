import { EventFactory, Types } from "../Event/index.js"

export const errorEvent = EventFactory(Types.Object.Def({ 
    system: "Debug",
    uuid: Types.UUID.Def(),
    message: Types.String.Def()
}, true))