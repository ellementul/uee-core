export { Types, EventFactory } from './src/Event/index.js'

import changeEvent from './src/Member/events/change_state_event.js'
import connectEvent from './src/Member/events/connected_event.js'
import errorEvent from './src/Member/events/error_event.js'
import logEvent from './src/Member/events/log_event.js'

import { MemberFactory } from './src/Member/index.js'

const events = {
  // changeEvent,
  // change: changeEvent,
  // connectEvent,
  // connect: connectEvent,
  // errorEvent,
  // error: errorEvent,
  // logEvent,
  // log: logEvent,
}

export { MemberFactory, events }