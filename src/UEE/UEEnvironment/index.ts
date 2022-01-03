import { IEvent, IAction, IModuleMessage, TMessage, THandleCallingEvent, THandleSentEventMessage } from './types'

import EventEmitter from 'events'
import { UEEModule } from '../UEEModule'

const sendingMessage = Symbol()

class UEEError extends Error {
  constructor (message) {
    const errorMessage = `UEEnviroment Errror: ${message}`
    super(errorMessage)
  }
}

export class UEEnviroment {

  public onSendingMessage(cb: THandleSentEventMessage) {
    this.emitter.addListener(sendingMessage, cb)
  }

  public receiveMessage ({ type, action }: TMessage) {

    switch (type) {
      case "EventsService":
        this.receiveEventMessage(action)
        break
      default:
        throw new UEEError(`Unknowed message type in message: ${type}`)
    }
  }

  public onSubcribingEvent (eventName: string, cb: THandleCallingEvent): void {
    if(this.eventSubsribes.has(eventName))
      this.subscribeEvent(eventName, cb)
    else
      this.waitedSubscribes.set(cb, eventName)
  }


  // Private area
  private emitter = new EventEmitter
  private eventSubsribes: Map<string, THandleCallingEvent[]> = new Map
  private waitedSubscribes: Map<THandleCallingEvent, string> = new Map

  private sendMessage(message: IModuleMessage) {
    this.emitter.emit(sendingMessage, message)
  }

  private receiveEventMessage ({ type, event }: IAction) {

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

  private prepareSubscribeEvent(moduleUid) { 
    return ((eventName: string, cb: THandleCallingEvent): void => {
      const handleList = this.eventSubsribes.get(eventName)
      handleList.push(cb)

      this.sendMessage({
        type: "ModulesService",
        action: {
          type: "ListenEvent",
          event: {
            name: eventName
          },
          module: {
            uid: moduleUid
          }
        }
      })
    })
  }

  private calledEvent (event: IEvent): void {

  }
}