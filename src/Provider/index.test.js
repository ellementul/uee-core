const { Provider } = require("./index.js")
const { TestTransport } = require("../Transport/test-class.js")

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

  test('recieve event', done => {
    const dispatcher = new Provider

    dispatcher.defineListenerEvent({})
    dispatcher.onRecieveEvent(event => {
      expect(event).toEqual({})
      done()
    })

    dispatcher.sendEvent({})
  });

  test('recieve event via transport', done => {
    const dispatcherSource = new Provider

    const event = {}
    const transport = new TestTransport(() => {}, [event])

    const dispatcherTarget = new Provider
    dispatcherSource.setTransport(transport)
    dispatcherTarget.setTransport(transport)

    dispatcherTarget.defineListenerEvent({})
    dispatcherTarget.onRecieveEvent(event => {
      expect(event).toEqual({})
      done()
    })

    dispatcherSource.sendEvent(event)
  });
});