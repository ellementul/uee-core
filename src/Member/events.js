import { EventFactory, Types } from "../Event/index.js"

export const sourceEvent = EventFactory(Types.Object.Def({
    sourceUid: Types.Key.Def(3),
}, true))

export const minimalExternalEvent = EventFactory(Types.Object.Def({
    timestamp: Types.Index.Def(2**53 - 1),
    sourceUid: Types.Key.Def(3),
    hash: Types.Key.Def(3)
}, true))