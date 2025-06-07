import { EventFactory, Types } from "../Event/index.js"

export const memeberChangedEvent = EventFactory(Types.Object.Def({
    system: "Members",
    uuid: Types.UUID.Def(),
    value: Types.Any.Def(),
    oldValue: Types.Any.Def()
}))