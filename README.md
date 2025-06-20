# UnyEvents Core

A powerful event-driven communication framework for building distributed systems and real-time applications. UEE Core provides a flexible architecture for managing event-based communication between different components in your application.

### Other langs
#### [Russian](README.ru.md)

## Features

- **Event-Driven Architecture**: Built on a robust event system for flexible communication
- **Room-Based Organization**: Organize components into rooms for better structure
- **Multiple Transport Options**: Support for various transport mechanisms including:
  - In-memory transport for local communication
  - PeerJS transport for peer-to-peer communication
  - Reliable wrapper transport for enhanced reliability
- **Type-Safe Events**: Built-in type system for event definitions
- **Cross-Platform**: Works in both Node.js and browser environments
- **Extensible**: Easy to add new transport mechanisms and event types

## Installation

```bash
npm install @ellementul/uee-core
```

## Core Concepts

### Member

Member is a class that can be used to create a room or join a room. It can be used to send and receive messages.

#### Callbacks

- `onMakeRoom` - Called when a member becomes a room
- `onJoinRoom` - Called when a member joins a room
- `onReady` - Called when a member is ready to send and receive messages
- `onDestroy` - Called when a member is destroyed (e.g., when removed from a room)

#### Methods

- `makeRoom()`: Creates a new room or joins an existing room
- `addMember(member)`: Adds a member to a room
- `send(event, payload)`: Sends an event with a payload to a member
- `subscribe(event, handler)`: Subscribes to an event and provides a handler for the event

### Event
A typed message that defines the structure of communication between members. Events are type-safe and can be validated.

### Room
A special member that includes a Provider for processing messages and events. Rooms can contain multiple members and manage their communication.

## StatesMember

The `StatesMember` class is a specialized member implementation designed for managing state transitions and value validation in event-driven systems. It extends the base `MemberFactory` to provide:

- State management with possible value constraints
- Transition callbacks for state changes
- Value validation against allowed states
- Event-based state updates and notifications
- Subscribing to events to only defined state

#### Methods
- `setState`- Sets the member's state to a specified value. Triggers transition callbacks and emits a memberChangedEvent if the state changes.
- `checkValue` - Validates whether a given value is allowed (either a predefined possible value or ANY_STATE). If invalid, throws an error or sends an error event depending on context.
- `checkState` - Checks if the current state matches the provided value. Used for validation in callback handlers.
- `onTransition` - Registers a callback function to be invoked when transitioning from fromState to toState. Supports wildcard transitions using ANY_STATE.
- `removeTransitionCallback` - Removes a previously registered transition callback for the specified state pair.
- `subscribeForState` - Subscribes to events specifically related to state changes. Invokes the callback only when the member's state matches the provided 
state value.

## Usage Examples

### Creating a Member

```js
import { MemberFactory } from "@ellementul/uee-core"

const member = new MemberFactory()
```

### Creating a Room

```js
import { MemberFactory } from "@ellementul/uee-core"

const room = new MemberFactory()

// Optional callbacks
room.onMakeRoom = () => { 
    console.log("Room created successfully!") 
}

room.onInit = () => { 
    console.log("Room initialized!") 
}

room.makeRoom()
```

### Adding a Member to a Room

```js
import { MemberFactory } from "@ellementul/uee-core"

// Create and initialize the room
const room = new MemberFactory()
room.onMakeRoom = () => { console.log("Room created!") }
room.makeRoom()

// Create a member
const member = new MemberFactory()
member.onJoinRoom = () => { console.log("Member joined room") }
member.onReady = () => { console.log("Member is ready") }

// Add member to room
room.addMember(member)
```

### Deleting a Member from a Room

```js
import { MemberFactory } from "@ellementul/uee-core"

// Create and initialize the room
const room = new MemberFactory()
room.makeRoom()

// Create a member
const member = new MemberFactory()
member.onDestroy = () => { console.log("Member is being destroyed") }
room.addMember(member)

// Delete member from room
room.deleteMember(member.uuid)
```

### Creating and Sending Events

```js
import { Types, EventFactory } from "@ellementul/uee-core"

// Define event type
const type = Types.Object.Def({ 
    system: "Test", 
    action: Types.Any.Def("Switch On", "Switch Off") 
})

// Create event
const event = EventFactory(type)

// Send event with payload
const payload = { action: "Switch On" }
member.send(event, payload)
```

### Subscribing to Events

```js
import { Types, EventFactory } from "@ellementul/uee-core"

// Define and create event
const type = Types.Object.Def({ 
    system: "Test", 
    action: Types.Any.Def("Switch On", "Switch Off") 
})
const event = EventFactory(type)

// Subscribe to event
const handleEvent = (payload) => { 
    console.log("Received event:", payload) 
}
member.subscribe(event, handleEvent)
```

### Create Member with States

```js
import { StatesMember, DEFAULT_STATE, ANY_STATE } from './StateMember/index.js'

const STATE_ONE = 'state1'
const STATE_TWO = 'state2'

// Create a member with possible values
const myMember = new StatesMember([STATE_ONE, STATE_TWO])

console.log(myMember.checkState(DEFAULT_STATE)) // true

// Set state to valid value
myMember.setState(STATE_ONE)

// Check if current state is 'state1'
console.log(myMember.checkState(STATE_ONE)) // true

// Add transition callback from state 'state1' to 'state2'
myMember.onTransition(ANY_STATE, STATE_TWO, () => {
    console.log('Transitioning from any state to state2')
})

// Getting events when the state is state2
member.subscribeForState(STATE_TWO, event, callback)
```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:w

# Run browser tests
npm run test:browser:ticker
npm run test:browser:member
npm run test:browser:peerjs
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.