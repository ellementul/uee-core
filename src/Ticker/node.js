export class NodeTicker {
    constructor() {
        this._cb = () => {}
        this._timer = null
    }

    set ontick (cb) {
        if(typeof cb === "function")
            this._cb = cb
        else
            throw new TypeError("callback is not function!")
    }

    start() {
        this._timer = setInterval(this._cb, 0)
    }

    stop() {
        clearInterval(this._timer)
    }
}