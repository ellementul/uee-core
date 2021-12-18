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

describe('Add listener node', () => {
  const events = new Events()
  const eventName = 'Something Name!'
  const nodeUid = randomUUID()
  events.receiveMessage({action: 'DefineEvent', name: eventName})

  test('New listener', () => {
    jest.spyOn(console, 'info')
    .mockImplementationOnce(message => {
      expect(message).toBe(`New listaner "${eventName}" for event "${nodeUid}"`)
    })

    events.receiveMessage({action: 'ListenEvent', name: eventName, node: nodeUid})
    expect(console.info).toHaveBeenCalled()
  })

  test('Repeat listener', () => {
    events.receiveMessage({action: 'ListenEvent', name: eventName, node: nodeUid})
  })

  test('Undefined event', () => {
    const undefindEventName = 'Smothing the other name!'

    expect(() => {
      events.receiveMessage({action: 'ListenEvent', name: undefindEventName, node: nodeUid})
    }).toThrow(new UndefinedEventError(undefindEventName))
  })
})

describe('Calling event', () => {
  const events = new Events()
  const eventNameOne = 'Something Name One!'
  const eventNameTwo = 'Something Name Two!'
  const nodeUidOne = randomUUID()
  const nodeUidTwo = randomUUID()
  const nodeUidThree = randomUUID()

  events.receiveMessage({action: 'DefineEvent', name: eventNameOne})
  events.receiveMessage({action: 'DefineEvent', name: eventNameTwo})
  events.receiveMessage({action: 'ListenEvent', name: eventNameOne, node: nodeUidOne})
  events.receiveMessage({action: 'ListenEvent', name: eventNameOne, node: nodeUidThree})
  events.receiveMessage({action: 'ListenEvent', name: eventNameTwo, node: nodeUidTwo})

  const cbCalllingEvents = jest.fn()

  test('Calling event for two nodes', () => {
    
    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameOne,
        nodes: [nodeUidOne, nodeUidThree]
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({action: 'CallEvent', name: eventNameOne})

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling event without nodes', () => {
    const eventNameWithoutNodes = 'Event Name Without Nodes'
    events.receiveMessage({action: 'DefineEvent', name: eventNameWithoutNodes})

    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameWithoutNodes,
        nodes: []
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.receiveMessage({action: 'CallEvent', name: eventNameWithoutNodes})

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling undefined event', () => {
    const undefinedEventName = 'Undefinde Event Name'

    expect(() => {
      events.receiveMessage({action: 'CallEvent', name: undefinedEventName})
    }).toThrow(new UndefinedEventError(undefinedEventName))
    
  })
})
