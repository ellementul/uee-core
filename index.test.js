import test from 'ava'

import { 
  Types, 
  EventFactory,
  MemberFactory
} from './index.js'

test('testing export main classes', t => {
  t.truthy(Types)
  t.truthy(EventFactory)
  t.truthy(MemberFactory)
})