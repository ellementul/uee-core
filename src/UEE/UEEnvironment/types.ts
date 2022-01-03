type TDEFINE = 'DefineEvent'
type TLISTEN = 'ListenEvent'
export type TCALL = 'CallEvent'
export type TEventAction = TDEFINE | TLISTEN | TCALL

type REGISTER_MODULE = 'RegisterNewModule'
export type TActionModule = REGISTER_MODULE

export type TMODULES_SERVICE = 'ModulesService'
export type TEVENTS_SERVICE = 'EventsService'
export type TMessageType = TMODULES_SERVICE | TEVENTS_SERVICE

export interface IEvent {
  name: string,
  payload?: object
}

export interface IModule {
  uid: string
}

export interface IAction {
  type: TEventAction,
  event: IEvent
}

export interface IModuleAction {
  type: TEventAction,
  event: IEvent,
  module: IModule
}

export interface IActionMessage {
  type: TEVENTS_SERVICE,
  action: IAction
}

export interface IModuleMessage {
  type: TMODULES_SERVICE,
  action: IModuleAction
}

export type TMessage = IActionMessage
export type THandleSentEventMessage = (message: IModuleMessage) => void

export type THandleCallingEvent = (data: Object) => void