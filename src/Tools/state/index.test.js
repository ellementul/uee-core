import test from 'ava'
import sinon from 'sinon'
import { MemberFactory } from '../../Member/index.js'
import { ANY_STATE, DEFAULT_STATE, StateTool } from './index.js'

function createTool(possibleValues = ['idle', 'active', 'finished']) {
    const member = new MemberFactory()
    member.addTool(StateTool({ possibleValues }))
    return { member, tool: member.tools.State }
}

test('StateTool requires possible values', t => {
    t.throws(() => StateTool({ possibleValues: [] }), {
        message: 'possibleValues cannot be empty'
    })
    t.throws(() => StateTool(), {
        message: 'possibleValues cannot be empty'
    })
})

test('tool registration', t => {
    const { tool } = createTool(['value1', 'value2', 'value3'])

    t.truthy(tool)
    t.is(tool.state(), DEFAULT_STATE)
    t.true(tool.checkState(DEFAULT_STATE))
    t.false(tool.checkState('value1'))
    t.deepEqual(tool.possibleValues(), ['value1', 'value2', 'value3', DEFAULT_STATE])
})

test('setState with valid value', t => {
    const { tool } = createTool(['value1', 'value2'])
    const callback = sinon.fake()
    tool.onTransition(DEFAULT_STATE, 'value1', callback)

    tool.setState('value1')

    t.is(tool.state(), 'value1')
    t.true(tool.checkState('value1'))
    t.false(tool.checkState(DEFAULT_STATE))
    t.true(callback.calledOnceWith('value1', DEFAULT_STATE))
})

test('setState with invalid value', t => {
    const { tool } = createTool(['value1', 'value2'])

    t.throws(() => tool.setState('invalid'), {
        message: /Value "invalid" is not in the list of possible values/
    })
    t.is(tool.state(), DEFAULT_STATE)
})

test('checkState validates value', t => {
    const { tool } = createTool(['idle'])

    t.true(tool.checkState(DEFAULT_STATE))
    t.false(tool.checkState('idle'))
    t.throws(() => tool.checkState('invalid'), {
        message: /Value "invalid" is not in the list of possible values/
    })
})

test('state transition callback', t => {
    const { tool } = createTool()
    const callback = sinon.fake()

    tool.onTransition('idle', 'active', callback)
    tool.setState('idle')
    tool.setState('active')

    t.true(callback.calledOnce)
    t.true(callback.calledWith('active', 'idle'))
})

test('any state transition callbacks', t => {
    const { tool } = createTool()
    const anyToActive = sinon.fake()
    const idleToAny = sinon.fake()
    const anyToAny = sinon.fake()

    tool.setState('idle')

    tool.onTransition(ANY_STATE, 'active', anyToActive)
    tool.onTransition('idle', ANY_STATE, idleToAny)
    tool.onTransition(ANY_STATE, ANY_STATE, anyToAny)

    tool.setState('active')

    t.true(anyToActive.calledOnce)
    t.true(idleToAny.calledOnce)
    t.true(anyToAny.calledOnce)

    tool.setState('finished')

    t.true(anyToActive.calledOnce)
    t.false(idleToAny.calledTwice)
    t.true(anyToAny.calledTwice)
})

test('invalid state transition callback', t => {
    const { tool } = createTool(['idle', 'active'])

    t.throws(() => tool.onTransition('invalid', 'active', () => {}), {
        message: /Value "invalid" is not/
    })
    t.throws(() => tool.onTransition('idle', 'invalid', () => {}), {
        message: /Value "invalid" is not/
    })
})

test('remove state transition callback', t => {
    const { tool } = createTool()
    const callback = sinon.fake()

    tool.onTransition('idle', 'active', callback)

    tool.setState('idle')
    tool.setState('active')
    tool.setState('idle')
    t.true(callback.calledOnce)

    tool.removeTransitionCallback('idle', 'active')

    tool.setState('idle')
    tool.setState('active')
    t.true(callback.calledOnce)
})

test('remove any state transition callback', t => {
    const { tool } = createTool()
    const anyToActive = sinon.fake()
    const idleToAny = sinon.fake()

    tool.onTransition(ANY_STATE, 'active', anyToActive)
    tool.onTransition('idle', ANY_STATE, idleToAny)

    tool.removeTransitionCallback(ANY_STATE, 'active')
    tool.removeTransitionCallback('idle', ANY_STATE)

    tool.setState('idle')
    tool.setState('active')
    t.false(anyToActive.called)
    t.false(idleToAny.called)
})

test('setState compares values strictly', t => {
    const { tool } = createTool([1])
    const callback = sinon.fake()
    tool.onTransition(DEFAULT_STATE, 1, callback)

    tool.setState(1)

    t.throws(() => tool.setState('1'), { message: /Value "1" is not in the list/ })
    t.is(tool.state(), 1)
    t.is(typeof tool.state(), 'number')
    t.true(callback.calledOnceWith(1, DEFAULT_STATE))
})

test('ANY_STATE cannot be set as a state', t => {
    const { tool } = createTool(['idle', 'active'])

    t.throws(() => tool.setState(ANY_STATE), {
        message: /ANY_STATE is a wildcard/
    })
    t.is(tool.state(), DEFAULT_STATE)
})

test('invalid transition callback is rejected before changing state', t => {
    const { tool } = createTool(['idle', 'active'])
    const callback = sinon.fake()
    tool.onTransition(DEFAULT_STATE, 'active', callback)

    t.throws(() => tool.onTransition(DEFAULT_STATE, 'active', 42), {
        message: /Transition callback has to be a function/
    })

    t.is(tool.state(), DEFAULT_STATE)

    tool.setState('active')
    t.is(tool.state(), 'active')
    t.true(callback.calledOnceWith('active', DEFAULT_STATE))
})

test('self transitions are rejected', t => {
    const { tool } = createTool(['idle', 'active'])

    t.throws(() => tool.onTransition('idle', 'idle', () => {}), {
        message: /Self transition idle -> idle/
    })
    t.notThrows(() => tool.onTransition(ANY_STATE, ANY_STATE, () => {}))
})

test('wildcard transitions fire only on real state changes', t => {
    const { tool } = createTool(['idle', 'active'])
    const anyToAny = sinon.fake()
    const anyToIdle = sinon.fake()

    tool.onTransition(ANY_STATE, ANY_STATE, anyToAny)
    tool.onTransition(ANY_STATE, 'idle', anyToIdle)

    tool.setState('idle')
    tool.setState('idle')
    tool.setState('active')
    tool.setState('active')

    t.is(anyToAny.callCount, 2)
    t.deepEqual(anyToAny.firstCall.args, ['idle', DEFAULT_STATE])
    t.deepEqual(anyToAny.secondCall.args, ['active', 'idle'])

    t.is(anyToIdle.callCount, 1)
    t.deepEqual(anyToIdle.firstCall.args, ['idle', DEFAULT_STATE])
})

test('checkValue does not coerce values to ANY_STATE', t => {
    const { tool } = createTool(['idle'])

    t.throws(
        () => tool.checkValue({ toString: () => ANY_STATE }),
        { message: /not in the list of possible values/ }
    )
})

test('destroy clears transition callbacks', t => {
    const { member, tool } = createTool(['idle', 'active'])
    const callback = sinon.fake()
    tool.onTransition(DEFAULT_STATE, 'active', callback)

    member.destroy()

    t.is(tool.state(), DEFAULT_STATE)
    tool.setState('active')
    t.false(callback.called)
})
