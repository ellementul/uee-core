export class BrowserTicker {
    constructor() {
        const code = "setInterval(() => postMessage('tick')"
        const blob = new Blob([code], {type: 'application/javascript'})
        this._worker = new Worker(URL.createObjectURL(blob))
    }

    set ontick (cb) {
        this._worker.onmessage = cb
    }
}