import { IEvent } from '../UEEnvironment/types'
import { IEventMessage, handlerUpdateEventsType, handlerCallEventsType } from './types'

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

const updatingEvent = Symbol()
const callingEvent = Symbol()

class Event {
  name: string
  modules: Set<string>

  constructor (name:string) {
    this.name = name
    this.modules = new Set
  }
}

class Events {
  private eventList: Map<string, Event> = new Map

  private emitter = new EventEmitter

  public receiveMessage({ action: { type, event }, module }: IEventMessage): void {

    switch (type) {
      case "DefineEvent":
        this.createEvent(event)
        break
      case "ListenEvent":
        this.addListenerModule(event, module)
        break
      case "CallEvent":
        this.callEvent(event)
        break
      default:
        throw new EventError(`Unknowed action type in message: ${type}`)
    }
  }

  private createEvent(event: IEvent): void {
    const name = event.name

    if (this.eventList.has(name)) {
      console.warn(`Repeat defined event with name "${name}"`)
      return
    }

    this.eventList.set(name, new Event(name))
    this.emitter.emit(updatingEvent, Array.from(this.eventList.keys()))

    console.info(`Defined new event "${name}"`)
  }

  private addListenerModule(messageEvent: IEvent, moduleUid: string): void {
    const eventName = messageEvent.name

    const event = this.eventList.get(eventName)

    if(!event)
      throw new UndefinedEventError(eventName)

    event.modules.add(moduleUid)
    console.info(`New listaner "${eventName}" for event "${moduleUid}"`)
  }

  private callEvent({ name, payload }: IEvent) {
    const event = this.eventList.get(name)

    if(!event)
      throw new UndefinedEventError(name)

    const message = {
      type: "EventsService",
      action: { 
        type: "CallEvent", 
        event: { name, payload } 
      }
    }

    this.emitter.emit(callingEvent, { message, modules: [...event.modules] })
  }

  // Add listeners for js event
  public onUpdatingEvents(cb:handlerUpdateEventsType): void {
    this.emitter.addListener(updatingEvent, cb)
  }

  public onCallingEvents(cb: handlerCallEventsType): void {
    this.emitter.addListener(callingEvent, cb)
  }
}

export { EventError, UndefinedEventError, IEventMessage, Events }                                   