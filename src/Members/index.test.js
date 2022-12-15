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

    test('Send generated event', () => {
      const member = new Member
      const provider = new Provider
      const type = Types.Object.Def({ 
        system: "Testing", 
        index: Types.Index.Def(7) 
      })
      const event = EventFactory(type)
      const callback = jest.fn()

      member.setProvider(provider)
      member.onEvent(event, callback)

      expect(() => member.send(event, { index: 7 })).toThrow("payload")

      member.send(event, { index: 5 })

      expect(callback).toHaveBeenCalledWith({"index": 5, "system": "Testing"})
    });
  });
});