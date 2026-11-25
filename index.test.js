import test from 'ava'

import { 
  Types, 
  EventFactory,
  MemberFactory,
  RelationTool,
  StateTool,
  DEFAULT_STATE,
  ANY_STATE
} from './index.js'

test('testing export main classes', t => {
  t.truthy(Types)
  t.truthy(EventFactory)
  t.truthy(MemberFactory)
  t.truthy(RelationTool)
  t.truthy(StateTool)
  t.truthy(DEFAULT_STATE)
  t.truthy(ANY_STATE)
})