import { randomUUID } from 'crypto'
import { EventError, UndefinedEventError, Events } from './index'

test('Contsructor', () => {
  const events = new Events()
  expect(events).toBeInstanceOf(Events)
})

test('Invalid event action', () => {
  const events = new Events()
  const action = 'InvalidAction'
  const name = 'Something Name!'

  expect(() => {
    events.receiveMessage(JSON.parse(`{ "action": "${action}", "name": "${name}"}`))
  }).toThrow(new EventError(`Unknowed action in message: ${action}`))
})

describe('Create event', () => {
  const events = new Events()
  const name = 'Something Name!'

  test('New event', () => {
    jest.spyOn(console, 'info')
    .mockImplementationOnce(message => {
      expect(message).toBe(`Defined new event "${name}"`)
    })
    
    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([ name ])
    })

    events.onUpdatingEvents(cbUpdateEvents)
    events.receiveMessage({action: 'DefineEvent', name})

    expect(console.info).toHaveBeenCalled()
    expect(cbUpdateEvents).toHaveBeenCalledTimes(1)
  })

  test('Repeat event', () => {

    jest.spyOn(console, 'warn')
    .mockImplementationOnce(message => {
      expect(message).toBe(`Repeat defined event with name "${name}"`)
    })

    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([ name ])
    })

    events.onUpdatingEvents(cbUpdateEvents)
    events.receiveMessage({action: 'DefineEvent', name})

    expect(console.warn).toHaveBeenCalled()
    expect(cbUpdateEvents).toHaveBeenCalledTimes(0)
  })
})

describe('Add listener module', () => {
  const events = new Events()
  const eventName = 'Something Name!'
  const moduleUid = randomUUID()
  events.receiveMessage({action: 'DefineEvent', name: eventName})

  test('New listener', () => {
    jest.spyOn(console, 'info')
    .mockImplementationOnce(message => {
      expect(message).toBe(`New listaner "${eventName}" for event "${moduleUid}"`)
    })

    events.receiveMessage({action: 'ListenEvent', name: eventName, module: moduleUid})
    expect(console.info).toHaveBeenCalled()
  })

  test('Repeat listener', () => {
    events.receiveMessage({action: 'ListenEvent', name: eventName, module: moduleUid})
  })

  test('Undefined event', () => {
    const undefindEventName = 'Smothing the other name!'

    expect(() => {
      events.receiveMessage({action: 'ListenEvent', name: undefindEventName, module: moduleUid})
    }).toThrow(new UndefinedEventError(undefindEventName))
  })
})

describe('Calling event', () => {
  const events = new Events()
  const eventNameOne = 'Something Name One!'
  const eventNameTwo = 'Something Name Two!'
  const moduleUidOne = randomUUID()
  const moduleUidTwo = randomUUID()
  const moduleUidThree = randomUUID()

  events.receiveMessage({action: 'DefineEvent', name: eventNameOne})
  events.receiveMessage({action: 'DefineEvent', name: eventNameTwo})
  events.receiveMessage({action: 'ListenEvent', name: eventNameOne, module: moduleUidOne})
  events.receiveMessage({action: 'ListenEvent', name: eventNameOne, module: moduleUidThree})
  events.receiveMessage({action: 'ListenEvent', name: eventNameTwo, module: moduleUidTwo})

  const cbCalllingEvents = jest.fn()

  test('Calling event for two modules', () => {
    
    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameOne,
        modules: [moduleUidOne, moduleUidThree]
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({action: 'CallEvent', name: eventNameOne})

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling event without modules', () => {
    const eventNameWithoutmodules = 'Event Name Without modules'
    events.receiveMessage({action: 'DefineEvent', name: eventNameWithoutmodules})

    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameWithoutmodules,
        modules: []
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({action: 'CallEvent', name: eventNameWithoutmodules})

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling undefined event', () => {
    const undefinedEventName = 'Undefinde Event Name'

    expect(() => {
      events.receiveMessage({action: 'CallEvent', name: undefinedEventName})
    }).toThrow(new UndefinedEventError(undefinedEventName))
    
  })
})
