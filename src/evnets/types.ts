import { TEventAction } from '../UEE/UEEnvironment/types'

export interface IEventMessage {
  action: TEventAction,
  name: string,
  module?: string
}

interface IEventCalling {
  name: string
  modules: string[]
}

export type handlerUpdateEventsType = (events: string[]) => void
export type handlerCallEventsType = (event: IEventCalling) => void