import sinon from "sinon"

import { Ticker } from './index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

export async function runTests() {
    const ticker = new Ticker

    console.log("Constructor: ", !!ticker)

    const callback = sinon.fake()
    ticker.ontick = callback
    ticker.start()

    await later(10)

    ticker.stop()
    const callCount = callback.callCount 

    console.log("Is called: ", callCount > 0)

    await later(0)

    console.log("Are not new calls: ", callCount === callback.callCount)
}

