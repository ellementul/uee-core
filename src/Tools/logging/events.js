import { EventFactory, Types } from "../../Event/index.js"

const system = "Logging"

export const loggingSubscriptionEvent = EventFactory(Types.Object.Def({
    system,
    action: "Subscription",
    timestamp: Types.Key.Def(),
    uuid: Types.UUID.Def(),
    sourceUuid: Types.UUID.Def(),
    eventHash: Types.Key.Def(),
    limit: Types.Number.Def(1024, -1, 0)
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