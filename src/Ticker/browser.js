export class BrowserTicker {
    constructor(maxJitter = 13) {
        const code = "setInterval(() => postMessage('tick'))"
        const blob = new Blob([code], {type: 'application/javascript'})
        this._worker = new Worker(URL.createObjectURL(blob))
        this._maxJitter = maxJitter
    }
    set ontick (cb) {
        if(typeof cb === "function")
            this._cb = cb
        else
            throw new TypeError("callback is not function!")
    }
    start() {
        this._worker.onmessage = () => setTimeout(this._cb, Math.random() * this._maxJitter)
    }
    stop() {
        this._worker.onmessage = () => {}
    }
}