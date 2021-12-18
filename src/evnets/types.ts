type DEFINE = 'DefineEvent'
type LISTEN = 'ListenEvent'
type CALL = 'CallEvent'
export type TActionType = DEFINE | LISTEN | CALL

export interface IEventMessage {
  action: TActionType,
  name: string,
  node?: string
}

interface IEventCalling {
  name: string
  nodes: string[]
}

export type handlerUpdateEventsType = (events: string[]) => void
export type handlerCallEventsType = (event: IEventCalling) => void