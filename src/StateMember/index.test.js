import test from 'ava'
import sinon from 'sinon'
import { DEFAULT_STATE, StatesMember } from './index.js'
import { errorEvent } from '../Member/events.js'
import { memberChangedEvent } from './events.js'

function later(delay) {
  return new Promise(function(resolve) {
      setTimeout(resolve, delay)
  })
}



test('constructor with empty possible values', t => {
    t.throws(() => {
        new StatesMember([])
    }, { message: 'possibleValues cannot be empty' })

    t.throws(() => {
        new StatesMember()
    }, { message: 'possibleValues cannot be empty' })
})

test('constructor with possible values', t => {
    const possibleValues = ['value1', 'value2', 'value3']
    const member = new StatesMember(possibleValues)
    t.truthy(member)
    t.is(member.state, 'default')
    t.true(member.checkState('default'))
    t.false(member.checkState('value1'))
    t.deepEqual(member.possibleValues, [...possibleValues, 'default'])
})

test('setState with valid value', async t => {
    const possibleValues = ['value1', 'value2']
    const member = new StatesMember(possibleValues)
    member.makeRoom()
    const callback = sinon.fake()
    member.subscribe(memberChangedEvent, callback)

    const value  = 'value1'

    member.setState(value)
    t.is(member.state, value)
    t.true(member.checkState(value))
    t.false(member.checkState(DEFAULT_STATE))

    await later(0)
    const message = callback.getCalls()[0].firstArg
    t.deepEqual(message, memberChangedEvent.createMsg({ uuid: member.uuid, oldValue: DEFAULT_STATE, value }))
})

test('setState with invalid value when not ready to send', t => {
    const possibleValues = ['value1', 'value2']
    const member = new StatesMember(possibleValues)
    
    t.throws(() => {
        member.setState('invalid')
    }, { message: /Value "invalid" is not in the list of possible values/ })
})

test('setState with invalid value when ready to send', async t => {
    const possibleValues = ['value1', 'value2']
    const member = new StatesMember(possibleValues)
    member.makeRoom()
    const errorCallback = sinon.fake()
    const changeCallback = sinon.fake()
    
    member.subscribe(errorEvent, errorCallback)
    member.subscribe(memberChangedEvent, changeCallback)
    
    member.setState('invalid')

    await later(0)
    
    t.true(errorCallback.calledOnce)
    t.false(changeCallback.calledOnce)
    t.is(member.state, DEFAULT_STATE)
})

// test('state transition callback', t => {
//     const possibleValues = ['idle', 'active', 'finished']
//     const member = new StatesMember(possibleValues)
//     const callback = sinon.fake()
    
//     member.onTransition('idle', 'active', callback)
//     member.setState('idle')
//     member.setState('active')
    
//     t.true(callback.calledOnce)
//     t.true(callback.calledWith('active', 'idle'))
// })

// test('any state transition callbacks', t => {
//     const possibleValues = ['idle', 'active', 'finished']
//     const member = new StatesMember(possibleValues)
//     const anyToActive = sinon.fake()
//     const idleToAny = sinon.fake()
//     const anyToAny = sinon.fake()
    
//     member.onTransition('any', 'active', anyToActive)
//     member.onTransition('idle', 'any', idleToAny)
//     member.onTransition('any', 'any', anyToAny)
    
//     member.setState('idle')
//     member.setState('active')
//     t.true(anyToActive.calledOnce)
//     t.true(idleToAny.calledOnce)
//     t.true(anyToAny.calledOnce)
    
//     member.setState('finished')
//     t.true(anyToActive.calledOnce) // Not called again
//     t.false(idleToAny.called) // Not called for this transition
//     t.true(anyToAny.calledTwice) // Called for all transitions
// })

// test('invalid state transition callback', t => {
//     const possibleValues = ['idle', 'active']
//     const member = new StatesMember(possibleValues)
    
//     t.throws(() => {
//         member.onTransition('invalid', 'active', () => {})
//     }, { message: /Invalid from state/ })
    
//     t.throws(() => {
//         member.onTransition('idle', 'invalid', () => {})
//     }, { message: /Invalid to state/ })
// })

// test('remove state transition callback', t => {
//     const possibleValues = ['idle', 'active', 'finished']
//     const member = new StatesMember(possibleValues)
//     const callback = sinon.fake()
    
//     member.onTransition('idle', 'active', callback)
//     member.removeTransitionCallback('idle', 'active')
    
//     member.setState('idle')
//     member.setState('active')
//     t.false(callback.called)
// })

// test('remove any state transition callback', t => {
//     const possibleValues = ['idle', 'active', 'finished']
//     const member = new StatesMember(possibleValues)
//     const anyToActive = sinon.fake()
//     const idleToAny = sinon.fake()
    
//     member.onTransition('any', 'active', anyToActive)
//     member.onTransition('idle', 'any', idleToAny)
    
//     member.removeTransitionCallback('any', 'active')
//     member.removeTransitionCallback('idle', 'any')
    
//     member.setState('idle')
//     member.setState('active')
//     t.false(anyToActive.called)
//     t.false(idleToAny.called)
// })

// test('onTransition with invalid states when not ready to send', t => {
//     const possibleValues = ['value1', 'value2']
//     const member = new StatesMember(possibleValues)
//     member.isReadyToSend = false
    
//     t.throws(() => {
//         member.onTransition('invalid', 'value1', () => {})
//     }, { message: /Value "invalid" is not in the list of possible values/ })
    
//     t.throws(() => {
//         member.onTransition('value1', 'invalid', () => {})
//     }, { message: /Value "invalid" is not in the list of possible values/ })
// })

// test('onTransition with invalid states when ready to send', t => {
//     const possibleValues = ['value1', 'value2']
//     const member = new StatesMember(possibleValues)
//     member.isReadyToSend = true
//     const errorCallback = sinon.fake()
    
//     member.subscribe(errorEvent, errorCallback)
    
//     member.onTransition('invalid', 'value1', () => {})
//     t.true(errorCallback.calledOnce)
    
//     member.onTransition('value1', 'invalid', () => {})
//     t.true(errorCallback.calledTwice)
// }) 