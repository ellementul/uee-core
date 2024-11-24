import { Ticker } from "../Ticker/index.js"

export class EventPull extends Array {
    constructor(onCallEvent) {
        if(typeof onCallEvent !== "function")
            throw new TypeError

        super()

        const ticker = new Ticker
        ticker.ontick = () => this.tick()
        this._callEvent = onCallEvent
    }

    tick() {
        while(this.length > 0)
            this._callEvent(this.pop())
    }
}