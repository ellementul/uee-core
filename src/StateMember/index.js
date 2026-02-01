import { MemberFactory } from '../Member/index.js'
import { memberChangedEvent } from './events.js'

export const DEFAULT_STATE = "default"
export const ANY_STATE = "any"

export class StatesMember extends MemberFactory {
    constructor(possibleValues) {
        super()

        if (!possibleValues || possibleValues.length === 0) {
            throw new Error('possibleValues cannot be empty')
        }

        this._possibleValues = new Set(possibleValues.concat([DEFAULT_STATE]))
        this._transitionCallbacks = new Map()

        this._state = DEFAULT_STATE
    }

    get state() {
        return this._state
    }

    get possibleValues() {
        return Array.from(this._possibleValues)
    }

    setState(value) {
        const oldValue = this._state

        if(value == oldValue)
            return

        if (this.checkValue(value)) {
            this._state = value
            this.send(memberChangedEvent, { uuid: this.uuid, value, oldValue })
            
            // Call transition callback if exists
            const callbacks = this._transitionCallbacks.get(oldValue)
            if (callbacks) {
                const callback = callbacks.get(value)
                if (callback)
                    callback(value, oldValue)

                const anyCallback = callbacks.get(ANY_STATE)
                if (anyCallback)
                    anyCallback(value, oldValue)
            }

            const anyCallbacks = this._transitionCallbacks.get(ANY_STATE)
            if(anyCallbacks) {
                const callback = anyCallbacks.get(value)
                if (callback)
                    callback(value, oldValue)

                const anyCallback = anyCallbacks.get(ANY_STATE)
                if (anyCallback)
                    anyCallback(value, oldValue)
            }
        }
    }

    checkValue(value) {
        const isValid = this._possibleValues.has(value) || value == ANY_STATE

        if (!isValid) {
            const errorMessage = `Value "${value}" is not in the list of possible values: ${this.possibleValues.join(', ')}`
            
            throw new Error(errorMessage)
        }

        return isValid
    }

    checkState(value) {
        if(this.debug)
            this.checkValue(value)
        
        return this._state === value
    }

    onTransition(fromState, toState, callback) {
        if(!this.checkValue(fromState) || !this.checkValue(toState))
            return

        if (!this._transitionCallbacks.has(fromState)) {
            this._transitionCallbacks.set(fromState, new Map())
        }
        
        const callbacks = this._transitionCallbacks.get(fromState)
        callbacks.set(toState, callback)
    }

    removeTransitionCallback(fromState, toState) {
        if (!this._transitionCallbacks.has(fromState)) {
            return
        }

        const callbacks = this._transitionCallbacks.get(fromState)
        callbacks.delete(toState)

        // Clean up empty maps
        if (callbacks.size === 0) {
            this._transitionCallbacks.delete(fromState)
        }
    }

    subscribeForState() {
        const [sate, event, callback, ...otherArgs] = arguments
        if(!this.checkValue(sate)) {
            return
        }

        super.subscribe(event, msg => {
            if(this.checkState(sate)) {
                callback(msg)
            }
        }, ...otherArgs)
    }
} 