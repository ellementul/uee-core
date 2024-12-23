import { Ticker } from "../Ticker/index.js"

export class EventPull extends Array {
    constructor(onCallEvent) {
        if(typeof onCallEvent !== "function")
            throw new TypeError

        super()

        this._ticker = new Ticker
        this._ticker.ontick = () => this.tick()

        this._callEvent = onCallEvent
    }

    push(value) {
        super.push(value)
        this._ticker.start()
    }

    tick() {
        while(this.length > 0)
            this._callEvent(this.pop())

        this._ticker.stop()
    }
}