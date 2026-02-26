import { EventFactory, Types } from "../../Event/index.js"

export const system = "MemberNetwork"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    pingNumber: Types.Index.Def(2**31 - 1),
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    role: Types.Key.Def(),
    runtime: Types.Key.Def(),
    parentUid: Types.Any.Def(Types.Const.Def(undefined), Types.UUID.Def()),
    children: Types.Array.Def(Types.UUID.Def(), 256, true),
    memberListSize: Types.Index.Def(1024*1024),
    memberListHash: Types.Key.Def(),
    receivedPings: Types.Index.Def(2**31 - 1)
}, true))

export const requestMemberListEvent = EventFactory(Types.Object.Def({
    system,
    action: "RequestMemberList",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    requestUuid: Types.UUID.Def()
}))

export const memberListEvent = EventFactory(Types.Object.Def({
    system,
    action: "MemberList",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    requestUuid: Types.UUID.Def(),
    members: Types.Array.Def(Types.Object.Def({
        uuid: Types.UUID.Def(),
        role: Types.Key.Def(),
        lastPingTimestamp: Types.Key.Def(),
        lastPingNumber: Types.Key.Def()
    }), 1024)
}))