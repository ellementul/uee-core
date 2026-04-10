import { NodeTicker } from "./node.js"
import { BrowserTicker } from "./browser.js"

let Ticker
if (typeof globalThis.document !== 'undefined')
    Ticker = BrowserTicker
else
    Ticker = NodeTicker

export { Ticker }