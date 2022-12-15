const { EventFactory, Types } = require('../Event/index')
const { Provider } = require("./index.js")
const { TestTransport } = require("../Transport/test-class")

describe('Name of the group', () => {
  test('Constructor without params', () => {
    const dispatcher = new Provider

    expect(dispatcher).toBeDefined()
  });

  test('connect transport', () => {
    const dispatcher = new Provider
    const event = {}

    const transport = {
      send: jest.fn(),
      onRecieve: callback => {
        gettingCallback = callback
      }
    }

    dispatcher.setTransport(transport)
    dispatcher.sendEvent(event)

    expect(transport.send).toHaveBeenCalledWith({
      data: event,
      from: dispatcher.uuid
    })
  });

  test('test transport', done => {
    const dispatcher = new Provider
    const event = {}

    dispatcher.setTransport(new TestTransport(done, [event]))
    dispatcher.sendEvent(event)
  });

  test('defined and calling event', () => {
    const dispatcher = new Provider
    const event = EventFactory(Types.Index.Def(7))
    const callback = jest.fn()

    dispatcher.onEvent(event, callback)

    dispatcher.sendEvent(1)
    expect(callback).toHaveBeenCalledWith(1)
  });

  test('diffrent events', () => {
    const dispatcher = new Provider

    const oneEvent = EventFactory(Types.Index.Def(7))
    const oneCallback = jest.fn()

    const twoEvent = EventFactory(Types.Index.Def(5))
    const twoCallback = jest.fn()

    const threeEvent = EventFactory(Types.Index.Def(3))
    const threeCallback = jest.fn()
    
    dispatcher.onEvent(oneEvent, oneCallback)
    dispatcher.onEvent(twoEvent, twoCallback)
    dispatcher.onEvent(threeEvent, threeCallback)

    dispatcher.sendEvent(4)
    expect(oneCallback).toHaveBeenCalledWith(4)
    expect(twoCallback).toHaveBeenCalledWith(4)
    expect(threeCallback.mock.calls.length).toBe(0)

  });
});