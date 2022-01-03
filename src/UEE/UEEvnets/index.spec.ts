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
    events.receiveMessage(JSON.parse(`{ "action": { "type": "${action}", "name": "${name}"} }`))
  }).toThrow(new EventError(`Unknowed action type in message: ${action}`))
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
    events.receiveMessage({ action: { type: 'DefineEvent', event: { name } } })

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
    events.receiveMessage({ action: { type: 'DefineEvent', event: { name } } })

    expect(console.warn).toHaveBeenCalled()
    expect(cbUpdateEvents).toHaveBeenCalledTimes(0)
  })
})

describe('Add listener module', () => {
  const events = new Events()
  const eventName = 'Something Name!'
  const moduleUid = randomUUID()
  events.receiveMessage({ action: { type: 'DefineEvent', event: { name: eventName } }})

  test('New listener', () => {
    jest.spyOn(console, 'info')
    .mockImplementationOnce(message => {
      expect(message).toBe(`New listaner "${eventName}" for event "${moduleUid}"`)
    })

    events.receiveMessage({ action: { type: 'ListenEvent', event: { name: eventName }}, module: moduleUid})
    expect(console.info).toHaveBeenCalled()
  })

  test('Repeat listener', () => {
    events.receiveMessage({ action: { type: 'ListenEvent', event: { name: eventName }}, module: moduleUid})
  })

  test('Undefined event', () => {
    const undefindEventName = 'Smothing the other name!'

    expect(() => {
      events.receiveMessage({ action: { type: 'ListenEvent', event: { name: undefindEventName }}, module: moduleUid})
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

  events.receiveMessage({ action: { type: 'DefineEvent', event: { name: eventNameOne } }})
  events.receiveMessage({ action: { type: 'DefineEvent', event: { name: eventNameTwo } }})
  events.receiveMessage({ action: { type: 'ListenEvent', event: { name: eventNameOne }}, module: moduleUidOne})
  events.receiveMessage({ action: { type: 'ListenEvent', event: { name: eventNameOne }}, module: moduleUidThree})
  events.receiveMessage({ action: { type: 'ListenEvent', event: { name: eventNameTwo }}, module: moduleUidTwo})

  const cbCalllingEvents = jest.fn()

  test('Calling event for two modules', () => {
    
    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        message: {
          type: "EventsService", 
          action: { type: 'CallEvent', event: { name: eventNameOne } }
        },
        modules: [moduleUidOne, moduleUidThree]
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({ action: { type: 'CallEvent', event: { name: eventNameOne }} })
    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling event without modules', () => {
    const eventNameWithoutmodules = 'Event Name Without modules'
    events.receiveMessage({ action: { type: 'DefineEvent', event: { name: eventNameWithoutmodules } }})

    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        message: {
          type: "EventsService", 
          action: { type: 'CallEvent', event: { name: eventNameWithoutmodules } }
        },
        modules: []
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({ action: { type: 'CallEvent', event: { name: eventNameWithoutmodules }} })

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling undefined event', () => {
    const undefinedEventName = 'Undefinde Event Name'

    expect(() => {
      events.receiveMessage({ action: { type: 'CallEvent', event: { name: undefinedEventName }} })
    }).toThrow(new UndefinedEventError(undefinedEventName))
    
  })
})
