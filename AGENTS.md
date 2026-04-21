# AGENTS.md

## Commands

```bash
npm test        # Run all tests (ava)
npm run test:w # Watch mode
```

Browser tests require `parcel` (pre-installed):
```bash
npm run test:browser:member
npm run test:browser:ticker
npm run test:browser:peerjs
```

## Project Structure

- **Entry**: `index.js` → exports `Types`, `EventFactory`, `MemberFactory`
- **Core**: `src/Member/index.js`, `src/Event/index.js`, `src/Provider/index.js`
- **Tests**: Match `**/*.test.js` (ava runs serially)

## Key Facts

- ES modules (`"type": "module"`)
- No lint/typecheck configured
- Test framework: `ava` with `sinon` for mocks
- Uses `@ellantul/message-types` for event typing

## Event-Driven Architecture

### Core Components

| Component | File | Role |
|-----------|------|------|
| Event | `src/Event/index.js` | Type-safe message with validation |
| Provider | `src/Provider/index.js` | Event router/dispatcher |
| Member | `src/Member/index.js` | Entity that sends/receives events |
| Room | `src/Tools/room/tool.js` | Member container with event bubbling |

### Event Flow

1. **Define type**: `Types.Object.Def({ system: "Test", action: Types.Any.Def("On", "Off") })`
2. **Create event**: `EventFactory(type)` returns event instance
3. **Send**: `member.send(event, payload)` → `Provider.sendEvent()` → validates & dispatches
4. **Subscribe**: `member.subscribe(event, callback)` registers with `Provider`

### Event Filtering

- `inEvents` - Allowed incoming event types (subscribed from outside room)
- `outEvents` - Allowed outgoing event types (bubbled to parent room)
- Set via `makeRoom({ inEvents, outEvents })`

### Event Bubbling

Events bubble up room hierarchy: child room → parent room. Parent can subscribe to child's events. Filtering controls what bubbles up via `outEvents`.

### Key Methods

- `member.send(type, payload)` - Send event to room
- `member.subscribe(type, callback)` - Receive events
- `member.makeRoom(opts)` - Create room with filtering
- `member.addMember(m)` / `member.deleteMember(uid)` - Manage members