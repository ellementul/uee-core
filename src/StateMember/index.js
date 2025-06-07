import { MemberFactory } from '../Member/index.js'
import { errorEvent } from '../Member/events.js'
import { errorEvent, memeberChangedEvent } from './events.js'


export class StatesMember extends MemberFactory {
    constructor(possibleValues) {
        super()

        if (!possibleValues || possibleValues.length === 0) {
            throw new Error('possibleValues cannot be empty')
        }

        this._state = possibleValues[0]
        this._possibleValues = new Set(possibleValues)
    }

    get state() {
        return this._state
    }

    get possibleValues() {
        return Array.from(this._possibleValues)
    }

    setState(value) {
        const oldValue = this._state

        if (this.checkValue(value)) {
            this._state = value
            this.send(memeberChangedEvent, { value, oldValue })
        }
    }

    checkValue(value) {
        const isValid = this._possibleValues.has(value)

        if (!isValid) {
            this.send(errorEvent, {
                uuid: this.uuid,
                message: `Value "${value}" is not in the list of possible values: ${this.possibleValues.join(', ')}`, 
                oldValue
            })
        }

        return isValid
    }

    checkState(value) {
        if(this.debug)
            this.checkState(value)
        
        return this._state === value
    }
} 