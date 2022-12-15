const { Member } = require('./index')
const { EventFactory, Types } = require('../Event/index')
const { Provider } = require("../Provider/index.js")

describe('Member', () => {
  test('constructor', () => {
    const member = new Member
    expect(member).toBeDefined()
  });

  test('setProvider', () => {
    const member = new Member
    const provider = new Provider

    member.setProvider(provider)
    expect(member).toBeDefined()
  });

  test('setProvider error', () => {
    const member = new Member

    expect(() => member.setProvider(null)).toThrow()
  });

  describe('calling events', () => {

    test('Defined event', () => {
      const member = new Member
      const provider = new Provider
      const event = EventFactory(Types.Index.Def(7))
      const callback = jest.fn()
  
      member.setProvider(provider)
      member.onEvent(event, callback)
      member.sendEvent(1)

      expect(callback).toHaveBeenCalledWith(1)
    });

    test('Defined event before provider', () => {
      const member = new Member
      const provider = new Provider
      const event = EventFactory(Types.Index.Def(7))
      const callback = jest.fn()
  
      member.onEvent(event, callback)
      member.sendEvent(1)

      member.setProvider(provider)

      expect(callback).toHaveBeenCalledWith(1)
    });
  });
});