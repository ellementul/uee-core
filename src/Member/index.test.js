const { Member } = require('./index')
const { EventFactory, Types } = require('../Event')
const { Provider } = require("../Provider")

describe('Member', () => {
  test('constructor', () => {
    const member = new Member
    expect(member).toBeDefined()
  });

  test('setProvider', () => {
    const member = new Member
    const provider = new Provider

    member.role = "TestRole"
    member.setProvider(provider)
    expect(member).toBeDefined()
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

  describe('events about state member', () => {
    test('connected', () => {
      const member = new Member
      const provider = new Provider
      const event = require('./events/connected_event')
      const callback = jest.fn()

      member.onEvent(event, callback)
      member.role = "TestRole"
      member.setProvider(provider)
      expect(callback).toHaveBeenCalledWith({
        ...event.create(),
        role: "TestRole",
        uuid: member.uuid
      })
    });

    test('any change member state', () => {
      const member = new Member
      const provider = new Provider
      const event = require('./events/change_state_event')
      const callback = jest.fn()
      
      member.onEvent(event, callback)
      member.role = "TestRole"
      member.setProvider(provider)
      const payload = {
        ...event.create(),
        state: "Connected",
        role: "TestRole",
        uuid: member.uuid
      }
      expect(callback).toHaveBeenCalledWith(payload)
    });

    test('Logging', () => {
      const member = new Member
      const provider = new Provider
      const event = require('./events/log_event')
      const callback = jest.fn()
      
      member.onEvent(event, callback)
      member.setProvider(provider)
      const message = {
        entity: "Run_Test",
        state: "Update"
      }
      member.send(event, message)

      const fullMessage = {
        ...event.create(),
        ...message
      }
      expect(callback).toHaveBeenCalledWith(fullMessage)
    });

    describe('Errors', () => {

      test('The error in callback', () => {
        const member = new Member
        const provider = new Provider

        const errorEvent = require('./events/error_event')
        const errorCallback = jest.fn(({ state: { name, message } }) => {
          expect(name).toBe("Error");
          expect(message).toBe("Testing Error");
        })
        member.onEvent(errorEvent, errorCallback)

        const event = EventFactory(Types.Key.Def())
        const callbackWithError = () => {
          throw new Error("Testing Error")
        }
        member.onEvent(event, callbackWithError)
        member.setProvider(provider)
        member.sendEvent("GettingError")

        expect(errorCallback).toHaveBeenCalled()
      });
      
    });
  });
});