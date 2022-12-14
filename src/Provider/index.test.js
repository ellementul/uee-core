const { Provider } = require("./index.js")
const { TestTransport } = require("../UEETransport/test-class.js")

describe('Name of the group', () => {
  test('Constructor without params', () => {
    const dispatcher = new Provider

    expect(dispatcher).toBeDefined()
  });

  test('connect transport', done => {
    const dispatcher = new Provider
    dispatcher.setTransport(new TestTransport(done, [{
      from: dispatcher.uuid
    }]))
    dispatcher.sendEvent({})
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

    const transport = new TestTransport(() => {}, [{
      from: dispatcherSource.uuid
    }])

    const dispatcherTarget = new Provider
    dispatcherSource.setTransport(transport)
    dispatcherTarget.setTransport(transport)

    dispatcherTarget.defineListenerEvent({})
    dispatcherTarget.onRecieveEvent(event => {
      expect(event).toEqual({})
      done()
    })

    dispatcherSource.sendEvent({})
  });
});