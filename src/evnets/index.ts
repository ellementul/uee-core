import EventEmitter from 'events'
import { randomUUID } from 'crypto'

interface IEvent {
  name: string
  uid: string
}

class Event implements IEvent {
  name: string
  uid: string
  nodes: string[]

  constructor(name:string) {
    this.name = name
    this.uid = randomUUID()
    this.nodes = []
  }
}

type handlerUpdateEventsType = (events: IEvent[]) => void

const updateEvent = Symbol()

class Events {
  private eventList: Event[] = []

  private emitter = new EventEmitter

  public createEvent(name:string): void {
    if(this.eventList.some(event => event.name === name))
      return

    this.eventList.push(new Event(name))
    this.emitter.emit(updateEvent, this.eventList.map(({ name, uid }) => ({ name, uid })))
  }

  public onUpdateEvents(cb:handlerUpdateEventsType): void {
    this.emitter.addListener(updateEvent, cb)
  }

  public addListenerNode(eventUid, nodeUid): void {
    this.eventList.filter(event => event.uid === eventUid)
  }
}

export default Events