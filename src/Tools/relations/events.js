import { EventFactory, Types } from "../../Event/index.js"

export const system = "MemberNetwork"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    pingNumber: Types.Index.Def(2**53 - 1),
    timestamp: Types.Index.Def(2**53 - 1),
    sourceUid: Types.Key.Def(3),
    role: Types.Key.Def(3),
    name: Types.Key.Def(),
    status: Types.Key.Def(3),
    runtime: Types.Index.Def(2**53 - 1),
    parentUid: Types.Union.Def(Types.Const.Def(undefined), Types.Key.Def(3)),
    children: Types.Array.Def(Types.Key.Def(3), 256, true),
    memberListSize: Types.Index.Def(1024*1024),
    memberListHash: Types.Key.Def(),
    receivedPings: Types.Index.Def(2**53 - 1),
    hash: Types.Key.Def(3)
}, true))