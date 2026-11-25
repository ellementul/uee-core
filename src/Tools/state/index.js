export const DEFAULT_STATE = "default"
export const ANY_STATE = "any"

export function StateTool({ possibleValues, name = 'State', initialState = DEFAULT_STATE } = {}) {
    if (!possibleValues || possibleValues.length === 0)
        throw new Error('possibleValues cannot be empty')

    return {
        name,
        depends: {},

        ToolFactory: () => {
            const allowedValues = new Set(possibleValues.concat([initialState]))

            if (!allowedValues.has(initialState) || initialState === ANY_STATE)
                throw new TypeError(`Initial state "${initialState}" has to be one of possible values`)

            const transitionCallbacks = new Map()
            let state = initialState

            const checkValue = value => {
                const isValid = allowedValues.has(value) || value === ANY_STATE

                if (!isValid) {
                    const errorMessage = `Value "${value}" is not in the list of possible values: ${[...allowedValues].join(', ')}`
                    throw new Error(errorMessage)
                }

                return isValid
            }

            const checkState = value => {
                checkValue(value)
                return state === value
            }

            const setState = value => {
                if (value === ANY_STATE)
                    throw new TypeError(`ANY_STATE is a wildcard, it cannot be used as a state`)

                const oldValue = state

                if (value === oldValue)
                    return

                checkValue(value)
                state = value

                if (oldValue !== ANY_STATE) {
                    const callbacks = transitionCallbacks.get(oldValue)
                    if (callbacks) {
                        const callback = callbacks.get(value)
                        if (callback)
                            callback(value, oldValue)

                        const anyCallback = callbacks.get(ANY_STATE)
                        if (anyCallback)
                            anyCallback(value, oldValue)
                    }
                }

                const anyCallbacks = transitionCallbacks.get(ANY_STATE)
                if (anyCallbacks) {
                    const callback = anyCallbacks.get(value)
                    if (callback)
                        callback(value, oldValue)

                    const anyCallback = anyCallbacks.get(ANY_STATE)
                    if (anyCallback)
                        anyCallback(value, oldValue)
                }
            }

            const onTransition = (fromState, toState, callback) => {
                if (typeof callback !== 'function')
                    throw new TypeError('Transition callback has to be a function!')

                checkValue(fromState)
                checkValue(toState)

                if (fromState === toState && fromState !== ANY_STATE)
                    throw new TypeError(`Self transition ${fromState} -> ${fromState} can never be triggered`)

                if (!transitionCallbacks.has(fromState))
                    transitionCallbacks.set(fromState, new Map())

                transitionCallbacks.get(fromState).set(toState, callback)
            }

            const removeTransitionCallback = (fromState, toState) => {
                if (!transitionCallbacks.has(fromState))
                    return

                const callbacks = transitionCallbacks.get(fromState)
                callbacks.delete(toState)

                if (callbacks.size === 0)
                    transitionCallbacks.delete(fromState)
            }

            const destroy = () => {
                transitionCallbacks.clear()
                state = initialState
            }

            return {
                state: () => state,
                possibleValues: () => [...allowedValues],
                checkValue,
                checkState,
                setState,
                onTransition,
                removeTransitionCallback,
                destroy
            }
        }
    }
}
