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
});