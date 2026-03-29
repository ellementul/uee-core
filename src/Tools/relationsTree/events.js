import { EventFactory, Types } from "../../Event/index.js"
import { system } from "../relations/events.js"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    role: Types.Key.Def(3),
    name: Types.Key.Def(),
    sourceUid: Types.Key.Def(3),
    parentUid: Types.Any.Def(Types.Const.Def(undefined), Types.Key.Def(3)),
    children: Types.Array.Def(Types.Key.Def(3), 256, true)
}, true))