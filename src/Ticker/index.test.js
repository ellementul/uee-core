import test from 'ava'
import sinon from "sinon"

import { Ticker } from './index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

test('constructor', t => {
  const ticker = new Ticker
  t.truthy(ticker)
})

test('ontick', async t => {
    const delay = 100
    const member = new Ticker

    const callback = sinon.fake()
    member.ontick = callback

    await later(delay)

    t.true(callback.callCount > 70)
    console.log(delay+"ms = "+callback.callCount+"ticks")
})