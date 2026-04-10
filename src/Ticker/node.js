export class NodeTicker {
    constructor(maxJitter = 13) {
        this._cb = () => {}
        this._timer = null
        this._maxJitter = maxJitter
    }
    set ontick (cb) {
        if(typeof cb === "function")
            this._cb = () => setTimeout(cb, Math.random() * this._maxJitter)
        else
            throw new TypeError("callback is not function!")
    }
    start() {
        if(this._timer) return
        this._timer = setInterval(this._cb, 0)
    }
    stop() {
        clearInterval(this._timer)
        this._timer = null
    }
}