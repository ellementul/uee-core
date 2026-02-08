import { EventFactory, Types } from "../../Event/index.js"

export const system = "Logging"

export const loggingSubscriptionEvent = EventFactory(Types.Object.Def({
    system,
    action: "Subscription",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    subscribedMemberUuid: Types.UUID.Def(),
    eventHash: Types.Key.Def(),
    limit: Types.Number.Def(1024, -1, 0),
    getSelfEvent: Types.Bool.Def()
}))

export const loggingErrorEvent = EventFactory(Types.Object.Def({
    system,
    action: "Error",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    error: {
        message: Types.String.Def(),
        stack: Types.String.Def(),
        name: Types.String.Def()
    }
}, true))


export const loggingSendingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Sending",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    eventHash: Types.Key.Def(),
    msgHash: Types.Key.Def(),
    isSendEvent: Types.Bool.Def()
}))

export const loggingReceivingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Receiving",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    eventHash: Types.Key.Def(),
    msgHash: Types.Key.Def(),
}))


export const outputEventsType = Types.Any.Def([
    loggingSubscriptionEvent.type,
    loggingErrorEvent.type,
    loggingSendingEvent.type,
    loggingReceivingEvent.type
])