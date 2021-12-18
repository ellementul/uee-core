import { randomUUID } from 'crypto'
import { EventError, UndefinedEventError, Events } from './index'



test('Contsructor', () => {
  const events = new Events()
  expect(events).toBeInstanceOf(Events)
})

describe('Create event', () => {
  const events = new Events()
  const name = 'Something Name!'

  test('New event', () => {
    
    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([ name ])
    })

    events.onUpdatingEvents(cbUpdateEvents)
    events.createEvent(name)

    expect(cbUpdateEvents).toHaveBeenCalledTimes(1)
  })

  test('Repeat event', () => {

    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([ name ])
    })

    events.onUpdatingEvents(cbUpdateEvents)
    events.createEvent(name)

    expect(cbUpdateEvents).toHaveBeenCalledTimes(0)
  })
})

describe('Add listener node', () => {
  const events = new Events()
  const eventName = 'Something Name!'
  const nodeUid = randomUUID()
  events.createEvent(eventName)

  test('New listener', () => {
    events.addListenerNode(eventName, nodeUid)
  })

  test('Repeat listener', () => {
    events.addListenerNode(eventName, nodeUid)
  })

  test('Undefined event', () => {
    const undefindEventName = 'Smothing the other name!'

    expect(() => {
      events.addListenerNode(undefindEventName, nodeUid)
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

  events.createEvent(eventNameOne)
  events.createEvent(eventNameTwo)
  events.addListenerNode(eventNameOne, nodeUidOne)
  events.addListenerNode(eventNameOne, nodeUidThree)
  events.addListenerNode(eventNameTwo, nodeUidTwo)

  const cbCalllingEvents = jest.fn()

  test('Calling event for two nodes', () => {
    
    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameOne,
        nodes: [nodeUidOne, nodeUidThree]
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.callEvent(eventNameOne)

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling event without nodes', () => {
    const eventNameWithoutNodes = 'Event Name Without Nodes'
    events.createEvent(eventNameWithoutNodes)

    cbCalllingEvents.mockImplementationOnce(event => {
      expect(event).toEqual({
        name: eventNameWithoutNodes,
        nodes: []
      })
    })
    events.onCallingEvents(cbCalllingEvents)
    events.callEvent(eventNameWithoutNodes)

    expect(cbCalllingEvents).toHaveBeenCalled()
  })

  test('Calling event without nodes', () => {
    const undefinedEventName = 'Undefinde Event Name'

    expect(() => {
      events.callEvent(undefinedEventName)
    }).toThrow(new UndefinedEventError(undefinedEventName))
    
  })
})
