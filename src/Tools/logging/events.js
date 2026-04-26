import { EventFactory, Types } from "../../Event/index.js"

export const system = "Logging"

const parentUid = Types.Any.Def(Types.Const.Def(undefined), Types.Key.Def(3))

export const loggingSubscriptionEvent = EventFactory(Types.Object.Def({
    system,
    action: "Subscription",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    sourceName: Types.Key.Def(),
    parentUid,
    subscribedMemberUid: Types.Key.Def(3),
    eventHash: Types.Key.Def(3),
    limit: Types.Number.Def(1024, -1, 0),
    getSelfEvent: Types.Bool.Def()
}))

export const loggingErrorEvent = EventFactory(Types.Object.Def({
    system,
    action: "Error",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    sourceName: Types.Key.Def(),
    parentUid,
    error: {
        message: Types.String.Def(),
        stack: Types.String.Def(),
        sourceName: Types.String.Def()
    }
}, true))


export const loggingSendingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Sending",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    sourceName: Types.Key.Def(),
    parentUid,
    eventHash: Types.Key.Def(3),
    msgHash: Types.Key.Def(3),
    isSendEvent: Types.Bool.Def()
}))

export const loggingReceivingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Receiving",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    sourceName: Types.Key.Def(),
    parentUid,
    eventHash: Types.Key.Def(3),
    msgHash: Types.Key.Def(3),
}))

export const loggingAddParentEvent = EventFactory(Types.Object.Def({
    system,
    action: "AddParent",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    sourceName: Types.Key.Def(),
    parentUid: Types.Key.Def(3)
}))

export const outputEventsType = Types.Any.Def([
    loggingSubscriptionEvent.type,
    loggingErrorEvent.type,
    loggingSendingEvent.type,
    loggingReceivingEvent.type,
    loggingAddParentEvent.type
])
