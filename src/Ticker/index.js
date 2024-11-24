import { NodeTicker } from "./node.js"
import { BrowserTicker } from "./browser.js"

let Ticker
if (globalThis.Worker)
    Ticker = BrowserTicker
else
    Ticker = NodeTicker

export { Ticker }