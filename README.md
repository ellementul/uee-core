# UnyEvents Core

A framework for event-driven communication between components organized in rooms.

### Other langs
#### [Russian](README.ru.md)

## Features

- **Event-driven architecture**: typed events with validation
- **Rooms**: members are grouped in rooms; events bubble through the room graph
- **Tools**: state machines, ping exchange and logging are attached to members as tools
- **Transport (planned)**: host/client connection factories and a virtual-room adapter; the architecture is described in [TODO.md](TODO.md)
- **Cross-platform**: works in Node.js and in the browser

## Installation

```bash
npm install @ellementul/uny-events
```

Public exports: `Types`, `EventFactory`, `MemberFactory`, `RelationTool`, `StateTool`, `DEFAULT_STATE`, `ANY_STATE`.

## Core concepts

### Member

`MemberFactory` can create a room, join another room and send/receive typed events.

Callbacks that are actually invoked:

- `onJoinRoom(roomUid)` — called when the member joins a room via `setOutsideRoom`;
- `onDestroy()` — called only by an explicit `destroy()` call; `deleteMember()` does not call it.

Methods:

- `makeRoom({ provider, inEvents, outEvents })` — creates a room on this member;
- `addMember(member)` / `deleteMember(uid)` — available after `makeRoom()`;
- `send(event, payload)` / `sendEvent(msg)` — send an event;
- `subscribe(event, handler, getSelfEvent, memberUid, limit)` — subscribe to an event;
- `subscribeTool(...)` / `unsubscribe(...)` — subscribe/unsubscribe with a tool id;
- `setOutsideRoom(room)` / `leaveRoom(roomUid)` — join/leave an external room;
- `destroy()` — destroys tools and leaves external rooms.

### Event

A typed message created by `EventFactory(type)`. It can validate payloads (`createMsg`, `isValid`, `getValidError`), compute a signature (`sign`) and dispatch callbacks (`on`, `off`, `call`).

### Room

A room is created by `makeRoom()` on a `MemberFactory` and lives at `member.tools.room`. It holds members (`addMember`, `deleteMember`, `children`), a `Provider`, and routes events (`sendEvent`, `subscribe`, `unsubscribe`). There is no separately exported `Room` class.

### Tools

`addTool(config)` attaches a tool to `member.tools[name]`. A config is produced by a factory function and has the shape `{ name, ToolFactory, depends }`; `ToolFactory(depends)` returns the tool object. `MemberFactory.destroy()` calls `tool.destroy()` on every tool that defines it.

## RelationTool (ping exchange)

```js
import { MemberFactory, RelationTool } from "@ellementul/uny-events"

const member = new MemberFactory()
member.makeRoom()
member.addTool(RelationTool({ statusValues: ['Running'], pingDelay: 250 }))

const relations = member.tools.Relations
relations.setRole('Master')
relations.setStatus('Running')
relations.onStatusTransition('Created', 'Running', (to, from) => { /* ... */ })
```

Options: `name` (default `"Relations"`), `statusValues` (default `['Created']`), `pingDelay` in ms (default `250`).

`role` is a plain string (`setRole`/`role`). `status` is a finite state managed by an internal `StateTool` registered as `member.tools.Status`; it starts at `'Created'`, accepts only `statusValues`, and is read/written via `status()`/`setStatus()`. Pings carry role, status, runtime, children and member-list hashes.

## StateTool

```js
import { MemberFactory, StateTool, ANY_STATE } from "@ellementul/uny-events"

const member = new MemberFactory()
member.makeRoom()
member.addTool(StateTool({ possibleValues: ['idle', 'active'] }))

const state = member.tools.State
state.onTransition('idle', 'active', (to, from) => { /* ... */ })
state.setState('idle')
state.setState('active')
```

Options: `possibleValues` (required, non-empty), `name` (default `"State"`), `initialState` (default `DEFAULT_STATE`). Transition rules accept `ANY_STATE` as a wildcard on either side; `ANY_STATE` cannot be set as a state. Self transitions `X → X` are rejected. State changes are delivered through transition callbacks only — no events are emitted.

Methods: `state()`, `possibleValues()`, `checkValue(value)`, `checkState(value)`, `setState(value)`, `onTransition(from, to, callback)`, `removeTransitionCallback(from, to)`, `destroy()`.

## Usage examples

### Creating a room and adding a member

```js
import { MemberFactory } from "@ellementul/uny-events"

const room = new MemberFactory()
room.makeRoom()

const member = new MemberFactory()
member.onJoinRoom = roomUid => console.log('joined', roomUid)
room.addMember(member)

room.deleteMember(member.uid())
```

### Sending and subscribing

```js
import { Types, EventFactory, MemberFactory } from "@ellementul/uny-events"

const type = Types.Object.Def({
  system: 'Test',
  action: Types.String.Def()
})
const event = EventFactory(type)

const member = new MemberFactory()
member.makeRoom()
member.subscribe(event, payload => console.log(payload))
member.send(event, { action: 'Switch On' })
```

## Development

```bash
npm test                       # all tests
npm run test:w                 # watch mode
npm run test:browser:ticker    # browser ticker suite
npm run test:browser:member    # browser member suite
```

## License

ISC
