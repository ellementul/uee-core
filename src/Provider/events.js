import { EventFactory, Types } from "../Event/index.js"

export const connectionEvent = EventFactory(Types.Object.Def({ 
    system: "Transport",
    action: "Connect", 
    isHost: Types.Bool.Def() 
}))
export const disconnectionEvent = EventFactory(Types.Object.Def({ 
    system: "Transport", 
    action: "Disconnect", 
    isHost: Types.Bool.Def() 
}))