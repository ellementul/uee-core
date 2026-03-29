import { EventFactory, Types } from "../Event/index.js"

export const memberChangedEvent = EventFactory(Types.Object.Def({
    system: "StatesMembers",
    uuid: Types.Key.Def(3),
    value: Types.Key.Def(3),
    oldValue: Types.Key.Def(3)
}))