import { TCALL, TEVENTS_SERVICE, IAction, IEvent } from '../UEEnvironment/types'

export interface IEventMessage {
  action: IAction,
  module?: string
}

export interface ICallAction {
  type: TCALL,
  event: IEvent
}

export interface ICallMessage {
  type: TEVENTS_SERVICE,
  action: ICallAction
}

interface IEventCalling {
  message: ICallMessage
  modules: string[]
}

export type handlerUpdateEventsType = (events: string[]) => void
export type handlerCallEventsType = (event: IEventCalling) => void