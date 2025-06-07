import { EventFactory, Types } from "../Event/index.js"

export const memberChangedEvent = EventFactory(Types.Object.Def({
    system: "StatesMembers",
    uuid: Types.UUID.Def(),
    value: Types.Key.Def(),
    oldValue: Types.Key.Def()
}))