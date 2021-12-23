type DEFINE = 'DefineEvent'
type LISTEN = 'ListenEvent'
type CALL = 'CallEvent'
export type TActionType = DEFINE | LISTEN | CALL

export interface IEventMessage {
  action: TActionType,
  name: string,
  module?: string
}

interface IEventCalling {
  name: string
  modules: string[]
}

export type handlerUpdateEventsType = (events: string[]) => void
export type handlerCallEventsType = (event: IEventCalling) => void