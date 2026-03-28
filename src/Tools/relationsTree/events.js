import { EventFactory, Types } from "../../Event/index.js"
import { system } from "../relations/events.js"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    role: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    parentUid: Types.Any.Def(Types.Const.Def(undefined), Types.UUID.Def()),
    children: Types.Array.Def(Types.UUID.Def(), 256, true)
}, true))