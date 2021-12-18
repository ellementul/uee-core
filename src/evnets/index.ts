import EventEmitter from 'events'

class EventError extends Error {
  constructor (message) {
    const errorMessage = `Module Events Errror: ${message}`
    super(errorMessage)
  }
}

class UndefinedEventError extends EventError {
  constructor (message) {
    const errorMessage = `The event with this name is undefined, name: ${message}`
    super(errorMessage)
  }
}

class Event {
  name: string
  nodes: Set<string>

  constructor (name:string) {
    this.name = name
    this.nodes = new Set
  }
}

interface EventCalling {
  name: string
  nodes: string[]
}

type handlerUpdateEventsType = (events: string[]) => void
type handlerCallEventsType = (event: EventCalling) => void

const updatingEvent = Symbol()
const callingEvent = Symbol()

class Events {
  private eventList: Map<string, Event> = new Map

  private emitter = new EventEmitter

  public createEvent(name:string): void {
    if (this.eventList.has(name)) {
      console.warn(`Repeat defined event with name "${name}"`)
      return
    }

    this.eventList.set(name, new Event(name))
    this.emitter.emit(updatingEvent, Array.from(this.eventList.keys()))

    console.info(`Defined new event "${name}"`)
  }

  public addListenerNode(eventName, nodeUid): void {
    const event = this.eventList.get(eventName)

    if(!event)
      throw new  UndefinedEventError(eventName)

    event.nodes.add(nodeUid)
    console.info(`New listaner "${eventName}" for event "${nodeUid}"`)
  }

  public callEvent(name: string) {
    const event = this.eventList.get(name)

    if(!event)
      throw new UndefinedEventError(name)

    this.emitter.emit(callingEvent, { name, nodes: [...event.nodes] })
  }

  // Add listeners for js event
  public onUpdatingEvents(cb:handlerUpdateEventsType): void {
    this.emitter.addListener(updatingEvent, cb)
  }

  public onCallingEvents(cb: handlerCallEventsType): void {
    this.emitter.addListener(callingEvent, cb)
  }
}

export { EventError, UndefinedEventError, EventCalling, Events }                                   