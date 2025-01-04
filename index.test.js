import test from 'ava'

import { 
  Types, 
  EventFactory,
  MemberFactory,
  errorEvent
} from './index.js'

test('testing export main classes', t => {
  t.truthy(Types)
  t.truthy(EventFactory)
  t.truthy(MemberFactory)
  t.truthy(errorEvent)
})