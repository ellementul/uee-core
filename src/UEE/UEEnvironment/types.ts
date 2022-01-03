type TDEFINE = 'DefineEvent'
type TLISTEN = 'ListenEvent'
export type TCALL = 'CallEvent'
export type TEventAction = TDEFINE | TLISTEN | TCALL

type REGISTER_MODULE = 'RegisterNewModule'
export type TActionModule = REGISTER_MODULE

type MODULES_SERVICE_TYPE = 'ModulesService'
export type EVENTS_SERVICE = 'EventsService'
export type TMessageType = MODULES_SERVICE_TYPE | EVENTS_SERVICE

export interface IEvent {
  name: string,
  payload?: object
}

export interface IAction {
  type: TEventAction,
  event: IEvent
}

export interface IActionMessage {
  type: EVENTS_SERVICE,
  action: IAction
}

export type TEventMessage = IActionMessage

export type THandleCallingEvent = (data: Object) => void