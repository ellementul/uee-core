import test from 'ava'
import sinon from "sinon"

import { EventFactory, Types } from '../Event/index.js'
import { Provider } from './index.js'

import { TestTransport } from '../Transport/test-class.js'


test('Constructor without params', t => {
  const provider = new Provider

  t.truthy(provider)
})

test('defined and calling event', t => {
  const provider = new Provider
  const event = EventFactory(Types.Index.Def(7))
  const callback = sinon.fake()

  provider.onEvent(event, callback)

  provider.sendEvent(1)
  t.truthy(callback.calledOnce)
})

test('defined and destroy event', t => {
  const provider = new Provider
  const event = EventFactory(Types.Index.Def(7))
  const callback = sinon.fake()
  const removedCallback = sinon.fake()

  provider.onEvent(event, callback)
  provider.onEvent(event, removedCallback)

  provider.sendEvent(1)
  t.truthy(callback.calledWith(1))
  t.truthy(removedCallback.calledOnce)

  provider.offEvent(event, removedCallback)

  provider.sendEvent(2)
  t.truthy(callback.calledWith(2))
  t.truthy(removedCallback.calledOnce)
})

test('defined limit event', t => {
  const provider = new Provider
  const event = EventFactory(Types.Index.Def(7))
  const callback = sinon.fake()

  provider.onEvent(event, callback, null, 1)

  provider.sendEvent(1)
  t.truthy(callback.calledOnce)

  provider.sendEvent(2)
  t.truthy(callback.calledOnce)
})

test('diffrent events', t => {
  const provider = new Provider

  const oneEvent = EventFactory(Types.Index.Def(7))
  const oneCallback = sinon.fake()

  const twoEvent = EventFactory(Types.Index.Def(5))
  const twoCallback = sinon.fake()

  const threeEvent = EventFactory(Types.Index.Def(3))
  const threeCallback = sinon.fake()
  
  provider.onEvent(oneEvent, oneCallback)
  provider.onEvent(twoEvent, twoCallback)
  provider.onEvent(threeEvent, threeCallback)

  provider.sendEvent(4)

  t.truthy(oneCallback.calledWith(4))
  t.truthy(twoCallback.calledWith(4))
  t.false(threeCallback.called)
})

test('logging callback', t => {
  const provider = new Provider
  const logCallback = sinon.fake()
  provider.setLogging(logCallback)

  const event = EventFactory(Types.Index.Def(7))
  const callback = sinon.fake()
  provider.onEvent(event, callback)

  provider.sendEvent(4)
  t.truthy(callback.calledWith(4))

  t.truthy(logCallback.calledWith({
    "message": 4, 
    "triggeredEvents": new Map([[event.sign(), event.toJSON()]])
  }))
})

test('the same event with diffrents provider', t => {
  const oneProvider = new Provider
  const twoProvider = new Provider

  const event = EventFactory(Types.Index.Def(7))

  const callback = sinon.fake()
  const secondCallback = sinon.fake()

  oneProvider.onEvent(event, callback)
  twoProvider.onEvent(event, secondCallback)

  oneProvider.sendEvent(1)
  twoProvider.sendEvent(1)

  t.true(callback.calledOnce)
  t.true(secondCallback.calledOnce)
})


test('test transport', t => {
  const provider = new Provider
  const event = {}

  provider.setTransport(new TestTransport(t.pass, [event]))
  provider.sendEvent(event)
})

test('connect transport', t => {
  const provider = new Provider
  const event = {}

  const transport = {
    send: sinon.fake(),
    onRecieve: callback => {}
  }

  provider.setTransport(transport)
  provider.sendEvent(event)

  t.true(transport.send.calledWith({
    data: event,
    from: provider.uuid
  }))
})

test('Local access', t => {
  const provider = new Provider
  const event = {
    access: "Local"
  }

  const transport = {
    send: sinon.fake(),
    onRecieve: callback => {}
  }

  provider.setTransport(transport)
  provider.sendEvent(event)

  t.false(transport.send.called)
})