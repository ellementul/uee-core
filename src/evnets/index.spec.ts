jest.mock('crypto', () => {
  const originalModule = jest.requireActual('crypto')

  //Mock the default export and named export 'foo'
  return {
    __esModule: true,
    ...originalModule,
    randomUUID: jest.fn(originalModule.randomUUID)
  };
});

import { randomUUID } from 'crypto'
import Events from './index'



test('Contsructor', () => {
  const events = new Events()
  expect(events).toBeInstanceOf(Events)
})

describe('Create event', () => {
  const events = new Events()
  const name = 'Something Name!'

  test('New event', () => {
    
    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([{ name, uid: expect.any(String) }])
    })

    events.onUpdateEvents(cbUpdateEvents)
    events.createEvent(name)

    expect(cbUpdateEvents).toHaveBeenCalledTimes(1)
  })

  test('Repeat event', () => {

    const cbUpdateEvents = jest.fn((eventList) => {
      expect(eventList).toEqual([{ name, uid: expect.any(String) }])
    })

    events.onUpdateEvents(cbUpdateEvents)
    events.createEvent(name)

    expect(cbUpdateEvents).toHaveBeenCalledTimes(0)
  })
})

describe('Add listener node', () => {
  const events = new Events()
  const nameEvent = 'Something Name!'
  const nodeUid = randomUUID()
  events.createEvent(nameEvent)

  test('New listener', () => {
    events.addListenerNode(nameEvent, nodeUid)
  })

  test('Repeat listener', () => {
    events.addListenerNode(nameEvent, nodeUid)
  })
})
