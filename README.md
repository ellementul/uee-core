# UnyEvents Core

A powerful event-driven communication framework for building distributed systems and real-time applications. UEE Core provides a flexible architecture for managing event-based communication between different components in your application.

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
A component that can send and receive messages. Members can be organized into rooms and communicate through events.

### Event
A typed message that defines the structure of communication between members. Events are type-safe and can be validated.

### Room
A special member that includes a Provider for processing messages and events. Rooms can contain multiple members and manage their communication.

### Transport
A communication channel that connects two rooms, enabling message exchange between them. Supports various transport mechanisms.

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

### Connecting Rooms with Transport

```js
// First room (Host)
import { MemberFactory, InMemory } from "@ellementul/uee-core"

const room1 = new MemberFactory()
const transport1 = new InMemory({ 
    id: "TestTransport", 
    isHost: true 
})

room1.makeRoom(transport1)
room1.connect()

// Second room (Client)
const room2 = new MemberFactory()
const transport2 = new InMemory({ 
    id: "TestTransport", 
    isHost: false 
})

room2.makeRoom(transport2)
room2.connect()
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