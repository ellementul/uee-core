const { EventFactory, Types } = require('../Event')
const { Provider } = require("./index")
const { TestTransport } = require("../Transport/test-class")

describe('Without transport', () => {
  test('Constructor without params', () => {
    const provider = new Provider

    expect(provider).toBeDefined()
  })

  test('defined and calling event', () => {
    const provider = new Provider
    const event = EventFactory(Types.Index.Def(7))
    const callback = jest.fn()

    provider.onEvent(event, callback)

    provider.sendEvent(1)
    expect(callback).toHaveBeenCalledWith(1)
  });

  test('diffrent events', () => {
    const provider = new Provider

    const oneEvent = EventFactory(Types.Index.Def(7))
    const oneCallback = jest.fn()

    const twoEvent = EventFactory(Types.Index.Def(5))
    const twoCallback = jest.fn()

    const threeEvent = EventFactory(Types.Index.Def(3))
    const threeCallback = jest.fn()
    
    provider.onEvent(oneEvent, oneCallback)
    provider.onEvent(twoEvent, twoCallback)
    provider.onEvent(threeEvent, threeCallback)

    provider.sendEvent(4)
    expect(oneCallback).toHaveBeenCalledWith(4)
    expect(twoCallback).toHaveBeenCalledWith(4)
    expect(threeCallback.mock.calls.length).toBe(0)

  });

  test('logging callback', () => {
    const provider = new Provider
    const logCallback = jest.fn()
    provider.setLogging(logCallback)

    const event = EventFactory(Types.Index.Def(7))
    const callback = jest.fn()
    provider.onEvent(event, callback)

    provider.sendEvent(4)
    expect(callback).toHaveBeenCalledWith(4)

    expect(logCallback).toHaveBeenCalledWith({
      "message": 4, 
      "triggeredEvents": new Map([[event.sign(), event.toJSON()]])
    })
  });

  test('the same event with diffrents provider', () => {
    const oneProvider = new Provider
    const twoProvider = new Provider

    const event = EventFactory(Types.Index.Def(7))

    const callback = jest.fn()
    const secondCallback = jest.fn()

    oneProvider.onEvent(event, callback)
    twoProvider.onEvent(event, secondCallback)

    oneProvider.sendEvent(1)
    twoProvider.sendEvent(1)
    expect(callback).toHaveBeenCalledTimes(1)
    expect(secondCallback).toHaveBeenCalledTimes(1)
  });
})

describe('With transport', () => {
  test('test transport', done => {
    const provider = new Provider
    const event = {}

    provider.setTransport(new TestTransport(done, [event]))
    provider.sendEvent(event)
  })

  test('connect transport', () => {
    const provider = new Provider
    const event = {}

    const transport = {
      send: jest.fn(),
      onRecieve: callback => {
        gettingCallback = callback
      }
    }

    provider.setTransport(transport)
    provider.sendEvent(event)

    expect(transport.send).toHaveBeenCalledWith({
      data: event,
      from: provider.uuid
    })
  })

  test('Local access', () => {
    const provider = new Provider
    const event = {
      access: "Local"
    }

    const transport = {
      send: jest.fn(),
      onRecieve: callback => {
        gettingCallback = callback
      }
    }

    provider.setTransport(transport)
    provider.sendEvent(event)

    expect(transport.send).not.toHaveBeenCalled()
  })
})