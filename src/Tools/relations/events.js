import { EventFactory, Types } from "../../Event/index.js"

export const system = "MemberNetwork"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    pingNumber: Types.Index.Def(2**31 - 1),
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    role: Types.Key.Def(3),
    status: Types.Key.Def(3),
    runtime: Types.Key.Def(3),
    parentUid: Types.Any.Def(Types.Const.Def(undefined), Types.Key.Def(3)),
    children: Types.Array.Def(Types.Key.Def(3), 256, true),
    memberListSize: Types.Index.Def(1024*1024),
    memberListHash: Types.Key.Def(3),
    receivedPings: Types.Index.Def(2**31 - 1)
}, true))

export const requestMemberListEvent = EventFactory(Types.Object.Def({
    system,
    action: "RequestMemberList",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    requestUid: Types.Key.Def(3)
}))

export const memberListEvent = EventFactory(Types.Object.Def({
    system,
    action: "MemberList",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    requestUid: Types.Key.Def(3),
    members: Types.Array.Def(Types.Object.Def({
        uuid: Types.Key.Def(3),
        role: Types.Key.Def(3),
        lastPingTimestamp: Types.Key.Def(3),
        lastPingNumber: Types.Key.Def(3)
    }), 1024)
}))