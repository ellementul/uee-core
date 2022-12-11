const { UEEDispatcher } = require("./index.js")
const { TestTransport } = require("../UEETransport/test-class.js")

describe('Name of the group', () => {
  test('Constructor without params', () => {
    const dispatcher = new UEEDispatcher

    expect(dispatcher).toBeDefined()
  });

  test('connect transport', done => {
    const dispatcher = new UEEDispatcher
    dispatcher.setTransport(new TestTransport(done, [{
      from: dispatcher.uuid
    }]))
    dispatcher.sendEvent({})
  });

  test('recieve event', done => {
    const dispatcher = new UEEDispatcher

    dispatcher.defineListenerEvent({})
    dispatcher.onRecieveEvent(event => {
      expect(event).toEqual({})
      done()
    })

    dispatcher.sendEvent({})
  });

  test('recieve event via transport', done => {
    const dispatcherSource = new UEEDispatcher

    const transport = new TestTransport(() => {}, [{
      from: dispatcherSource.uuid
    }])

    const dispatcherTarget = new UEEDispatcher
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