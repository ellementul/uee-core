# UEE Core
United Events Environment Core

## Concept
Member is a specific module
Event is a message type
Room is a member with Provider to process messages and events
Member can send message if it connect to Provider or Room
Member can get messages of defined type via subscribing on event in Room(or Provider)
Transport is a tunnel join two rooms in one via any connection

## Usage

### Create member
```js
import { MemberFactory } from "@ellementul/uee-core"

const member = new MemberFactory
```

### Make Room
```js
import { MemberFactory } from "@ellementul/uee-core"

const room = new MemberFactory
room.onMakeRoom = () => { console.log("The room is made!") } // Method-Callback if set then call after make room
room.onInit = () => { console.log("The room is made!") } // Method-Callback if set then call after make room or connection to room 
room.makeRoom()
```

### Add Member in Room
```js
import { MemberFactory } from "@ellementul/uee-core"

const room = new MemberFactory
room.onMakeRoom = () => { console.log("The room is made!") } // Method-Callback if set then call after make room
member.onReady = () => { console.log("The room is made!") } // Method-Callback if set then call after make room or connection to room 
room.makeRoom()

const member = new MemberFactory
member.onJoinRoom = () => { console.log("Member entered room") } // Method-Callback if set then call after make room
member.onReady = () => { console.log("The room is made!") } // Method-Callback if set then call after make room or connection to room

room.addMember(member)
```

### Create event
```js
import { Types, EventFactory } from "@ellementul/uee-core"

const type = Types.Object.Def({ system: "Test" })
const event = EventFactory(type)
```

### Send event
```js
const type = Types.Object.Def({ system: "Test", action: Types.Any.Def("Switch On", "Switch Off") })
const event = EventFactory(type)
const customPayload = { action: "Switch On" } // Correct payload for message type
member.send(event, customPayload) // Send message
```

### Subscribe event
```js
const type = Types.Object.Def({ system: "Test", action: Types.Any.Def("Switch On", "Switch Off") })
const event = EventFactory(type)
const callbackForEvent = () => { console.log("Got message") }
member.subscribe(event, callbackForEvent) // Subscribe message
```

### Join two Room via Transport
In first file
```js
import { MemberFactory, InMemory } from "@ellementul/uee-core"

const room = new MemberFactory
const transoport = new InMemory({ id: "TestTransport", isHost: true })

room.makeRoom(transoport)
```
In second file
```js
import { MemberFactory } from "@ellementul/uee-core"

const room = new MemberFactory
const transoport = new InMemory({ id: "TestTransport", isHost: false })

room.makeRoom(transoport)
```