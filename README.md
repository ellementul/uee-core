# UEE
United Events Environment


## Event

### Require
```js
const {
  EventFactory,
  Types,
  Provider,
  Members,
  events 
} = require('./index')
```

### Create event
```js
const event = EventFactory(Types.Object.Def({ system: "Log" }))
```

### Valid message by event
```js
const message = { system: "Log" }
event.isValid(message)
```