import { EventFactory, Types } from "../Event/index.js"

// Определение события создания объекта
export const objectCreatedEvent = EventFactory(Types.Object.Def({
  system: "Store",
  action: "ObjectCreated",
  key: Types.String.Def(),
  version: Types.String.Def(),
  data: Types.Any.Def(),
  namespace: Types.String.Def(),
  storeUuid: Types.UUID.Def()
}))

// Определение события конфликта версий
export const versionConflictEvent = EventFactory(Types.Object.Def({
  system: "Store",
  action: "VersionConflict",
  originalKey: Types.String.Def(),
  conflictingVersion: Types.String.Def(),
  namespace: Types.String.Def(),
  storeUuid: Types.UUID.Def()
}))