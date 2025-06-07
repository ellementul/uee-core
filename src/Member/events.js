import { EventFactory, Types } from "../Event/index.js"

const errorType = Types.Object.Def({ 
    system: "Exceptions"
}, true)

export const errorEvent = EventFactory(errorType)