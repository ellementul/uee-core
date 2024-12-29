export class BrowserTicker {
    constructor() {
        const code = "setInterval(() => postMessage('tick'))"
        const blob = new Blob([code], {type: 'application/javascript'})
        this._worker = new Worker(URL.createObjectURL(blob))
    }

    set ontick (cb) {
        if(typeof cb === "function")
            this._cb = cb
        else
            throw new TypeError("callback is not function!")
    }

    start() {
        this._worker.onmessage = this._cb
    }

    stop() {
        this._worker.onmessage = () => {}
    }
}