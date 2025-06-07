import test from 'ava'
import sinon from 'sinon'
import { StatesMember } from './StatesMember.js'
import { EventFactory, Types } from '../Event/index.js'
import { errorEvent, memeberChangedEvent } from '../Member/events.js'

const stateChangeEvent = EventFactory(Types.Object.Def({
    value: Types.Any.Def(),
    oldValue: Types.Any.Def()
}))

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
    t.is(member.state, 'value1')
    t.true(member.checkState('value1'))
    t.false(member.checkState('value2'))
    t.deepEqual(member.possibleValues, possibleValues)
})

test('setState with valid value', t => {
    const possibleValues = ['value1', 'value2']
    const member = new StatesMember(possibleValues)
    const callback = sinon.fake()
    member.subscribe(memeberChangedEvent, callback)

    member.setState('value1')
    t.is(member.state, 'value1')
    t.true(member.checkState('value1'))
    t.false(member.checkState('value2'))
    t.true(callback.calledOnceWith({ value: 'value1', oldValue: 'value1' }))
})

test('setState with invalid value', t => {
    const possibleValues = ['value1', 'value2']
    const member = new StatesMember(possibleValues)
    const errorCallback = sinon.fake()
    const changeCallback = sinon.fake()
    
    member.subscribe(errorEvent, errorCallback)
    member.subscribe(memeberChangedEvent, changeCallback)
    
    member.setState('invalid')
    
    t.true(errorCallback.calledOnce)
    t.true(changeCallback.calledOnce)
    t.is(member.state, 'invalid')
    t.true(member.checkState('invalid'))
    t.false(member.checkState('value1'))
})

test('setState without possible values', t => {
    const member = new StatesMember()
    const callback = sinon.fake()
    member.subscribe(stateChangeEvent, callback)

    member.setState('any value')
    t.is(member.state, 'any value')
    t.true(member.checkState('any value'))
    t.true(callback.calledOnceWith({ value: 'any value', oldValue: undefined }))
})

test('state change event with old value', t => {
    const possibleValues = ['old', 'new']
    const member = new StatesMember(possibleValues)
    const callback = sinon.fake()
    member.subscribe(memeberChangedEvent, callback)

    member.setState('old')
    t.true(member.checkState('old'))
    t.false(member.checkState('new'))
    
    member.setState('new')
    t.true(member.checkState('new'))
    t.false(member.checkState('old'))

    t.true(callback.calledWith({ value: 'new', oldValue: 'old' }))
}) 