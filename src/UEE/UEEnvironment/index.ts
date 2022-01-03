import { IEvent, IAction, THandleCallingEvent } from './types'

import EventEmitter from 'events'
import { UEEModule } from '../UEEModule'

const registeringModule = Symbol()
const subscribingEvent = Symbol()

class UEEError extends Error {
  constructor (message) {
    const errorMessage = `UEEnviroment Errror: ${message}`
    super(errorMessage)
  }
}

class UEEnviroment {
  private eventSubsribes: Map<string, THandleCallingEvent[]> = new Map
  private waitedSubscribes: Map<THandleCallingEvent, string> = new Map

  public receiveEventMessage ({ type, event }: IAction) {

    switch (type) {
      case "DefineEvent":
        this.defineEvent(event)
        break
      case "CallEvent":
        this.calledEvent(event)
        break
      default:
        throw new UEEError(`Unknowed action type in message: ${type}`)
    }
  }

  public onSubcribingEvent (eventName: string, cb: THandleCallingEvent): void {
    if(this.eventSubsribes.has(eventName))
      this.subscribeEvent(eventName, cb)
    else
      this.waitedSubscribes.set(cb, eventName)
  }

  private defineEvent (event: IEvent): void {
    const eventName = event.name
    const handlesList: THandleCallingEvent[] = []

    if(this.eventSubsribes.has(eventName))
      throw new UEEError(`The repeated defining evnet with name ${eventName}`)

    this.waitedSubscribes.forEach((cbEventName, cb) => {
      if(eventName === cbEventName) {
        handlesList.push(cb)
        this.waitedSubscribes.delete(cb)
      }
    })

    this.eventSubsribes.set(eventName, handlesList)
  }

  private subscribeEvent (eventName: string, cb: THandleCallingEvent): void {
    const handleList = this.eventSubsribes.get(eventName)
    handleList.push(cb)
  }

  private calledEvent (event: IEvent): void {

  }
}