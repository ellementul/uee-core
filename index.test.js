import test from 'ava'

import { 
  Types, 
  EventFactory,
  MemberFactory,
  events
} from './index.js'

test('testing export main classes', t => {
  t.truthy(Types)
  t.truthy(EventFactory)
  t.truthy(MemberFactory)
})

// test('testing export events', t => {
//   t.truthy(events)
//   t.is(Member.events, events)

//   t.truthy(events.change)
//   t.is(events.change, events.changeEvent)

//   t.truthy(events.connect)
//   t.is(events.connect, events.connectEvent)

//   t.truthy(events.error)
//   t.is(events.error, events.errorEvent)

//   t.truthy(events.log)
//   t.is(events.log, events.logEvent)
// })