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
        for(let eventCount = this.length; eventCount > 0; eventCount--)
            this._callEvent(this.shift())

        
        if(this.length === 0)
            this._ticker.stop()
    }
}