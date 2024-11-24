export class NodeTicker {
    constructor() {
        this._timer = setInterval(() => {})
    }

    set ontick (cb) {
        if(this._timer)
            clearInterval(this._timer)

        this._timer = setInterval(cb)
    }
}