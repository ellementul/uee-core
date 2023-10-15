export { Types, EventFactory } from './src/Event/index.js'
export { Provider } from './src/Provider/index.js'
export { AbstractTransport } from './src/Transport/index.js'
export { TestTransport } from './src/Transport/test-class.js'

import changeEvent from './src/Member/events/change_state_event.js'
import connectEvent from './src/Member/events/connected_event.js'
import errorEvent from './src/Member/events/error_event.js'
import logEvent from './src/Member/events/log_event.js'

import { Member } from './src/Member/index.js'

const events = {
  changeEvent,
  change: changeEvent,
  connectEvent,
  connect: connectEvent,
  errorEvent,
  error: errorEvent,
  logEvent,
  log: logEvent,
}

Member.events = events

export { Member, events }