const { EventFactory, Types } = require('./index')

describe('Event testing', () => {
  test('constructor', () => {
    const event = EventFactory(Types.Index.Def(7))
    expect(event).toBeDefined()
  });

  test('signature', () => {
    const event = EventFactory(Types.Index.Def(7))
    expect(event.sign()).toEqual("8c06eb0e-b55f-5156-bad8-676866da551e")
  });

  test('create', () => {
    const event = EventFactory(Types.Object.Def({ system: "Log" }))
    expect(event.create()).toEqual({"system": "Log"})
  });

  test('validation', () => {
    const event = EventFactory(Types.Index.Def(7))
    expect(event.isValid(5)).toBe(true)
    expect(event.isValid(7)).toBe(false)
  });

  test('calling', () => {
    const event = EventFactory(Types.Key.Def())
    const payload = "TestPayload"

    const firstCall = jest.fn()
    const secondCall = jest.fn()

    event.on(firstCall)
    event.on(secondCall)
    
    event.call(payload)

    expect(firstCall).toHaveBeenCalledWith(payload)
    expect(secondCall).toHaveBeenCalledWith(payload)
  });

  test('event from object', () => {
    const type = Types.Object.Def({
      system: "Testing",
      index: Types.Index.Def(100)
    })
    const json_type = require('./test_event.json')
    const json_event = EventFactory.fromJSON(json_type)
    const event = EventFactory(type)

    expect(json_event.sign()).toEqual(event.sign());
  });

  test('event to JSON', () => {
    const type = Types.Object.Def({
      system: "Testing",
      index: Types.Index.Def(100)
    })
    
    const event = EventFactory(type)
    const json_event = EventFactory.fromJSON(event.toJSON())

    expect(json_event.sign()).toEqual(event.sign());
  });
});