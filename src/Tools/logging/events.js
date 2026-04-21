import { EventFactory, Types } from "../../Event/index.js"

export const system = "Logging"

export const loggingSubscriptionEvent = EventFactory(Types.Object.Def({
    system,
    action: "Subscription",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
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
    error: {
        message: Types.String.Def(),
        stack: Types.String.Def(),
        name: Types.String.Def()
    }
}, true))


export const loggingSendingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Sending",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    eventHash: Types.Key.Def(3),
    msgHash: Types.Key.Def(3),
    isSendEvent: Types.Bool.Def()
}))

export const loggingReceivingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Receiving",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    eventHash: Types.Key.Def(3),
    msgHash: Types.Key.Def(3),
}))

export const loggingAddParentEvent = EventFactory(Types.Object.Def({
    system,
    action: "AddParent",
    timestamp: Types.Key.Def(3),
    sourceUid: Types.Key.Def(3),
    parentUid: Types.Key.Def(3)
}))

export const outputEventsType = Types.Any.Def([
    loggingSubscriptionEvent.type,
    loggingErrorEvent.type,
    loggingSendingEvent.type,
    loggingReceivingEvent.type,
    loggingAddParentEvent.type
])