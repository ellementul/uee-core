# UEE Core
United Events Environment Core

This module is part of main [UEE package]

## It contains definitions of basic entities for UEE:
- Event
- Member
- Provider
- Transport

## For members defined next events:
```js
const {
  events: {
    change, // Call when status of member is changed
    connect, // Call when status of member become "connected"
    log, // Prototype event for logging system 
    error // Call when there is error, it is part of logging system
  }
} = require("@ellementul/uee-core")
```
