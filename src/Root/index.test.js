import test from 'ava'
import { RootFactory } from './index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('Build tree', async t => {
  const root = new RootFactory()
  root.strictValidationEvent = true

  root.addMember(new RootFactory())
  root.addMember(new RootFactory())
  root.addMember(new RootFactory())

  await later(1)

  t.falsy(root.genTopologyToMd())

})