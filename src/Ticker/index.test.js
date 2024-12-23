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

test('start and stop', async t => {
    const ticker = new Ticker

    const callback = sinon.fake()
    ticker.ontick = callback
    ticker.start()

    await later(0)

    ticker.stop()
    const callCount = callback.callCount 

    t.true(callCount > 0)

    await later(0)

    t.is(callCount, callback.callCount)
})

test('count ticks', async t => {
    const ticker = new Ticker
    const delay = 100

    const callback = sinon.fake()
    ticker.ontick = callback
    ticker.start()

    await later(delay)

    ticker.stop()
    const callCount = callback.callCount 

    t.pass()
    t.log(delay+"ms = "+callCount+"ticks")
})