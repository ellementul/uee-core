import test from 'ava'
import { LoggerFactory } from './index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('Build tree', async t => {
  const root = new LoggerFactory()
  root.strictValidationEvent = true

  root.addMember(new LoggerFactory())
  root.addMember(new LoggerFactory())
  root.addMember(new LoggerFactory())

  await later(1)

  t.falsy(root.genTopologyToMd())

})