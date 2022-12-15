const { EventFactory, Types } = require('./index')

describe('Event testing', () => {
  test('constructor', () => {
    const event = EventFactory(Types.Index.Def(7))
    expect(event).toBeDefined()
  });

  test('signature', () => {
    const event = EventFactory(Types.Index.Def(7))
    expect(event.sign()).toBe(1574440322)
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
    const event = EventFactory(Types.String.Def("\\w", 100))
    const payload = "TestPayload"

    const firstCall = jest.fn()
    const secondCall = jest.fn()

    event.on(firstCall)
    event.on(secondCall)
    
    event.call(payload)

    expect(firstCall).toHaveBeenCalledWith(payload)
    expect(secondCall).toHaveBeenCalledWith(payload)
  });

  // test('event from object', () => {
  //   const type = Types.Object.Def({
  //     system: "Testing",
  //     index: Types.Index.Def(100)
  //   })
  //   const json_type = require('./test_event.json')
  //   const json_event = EventFactory(json_type)
  //   const event = EventFactory(type)

  //   expect(json_event.sign()).toBe(event.sign());
  // });
});