import test from 'ava'
import sinon from "sinon"

import { EventPull } from './index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}


test('constructor', t => {
  const pull = new EventPull(sinon.fake())
  t.truthy(pull)
})

test('call event', async t => {
    const callback = sinon.fake()
    const pull = new EventPull(callback)
    pull.push({ arg: "test" })

    await later(0)

    t.true(callback.called)
    t.is(callback.args[0][0].arg,"test")
  })
