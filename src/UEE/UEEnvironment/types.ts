type DEFINE = 'DefineEvent'
type LISTEN = 'ListenEvent'
type CALL = 'CallEvent'
export type TEventAction = DEFINE | LISTEN | CALL

type REGISTER_MODULE = 'RegisterNewModule'
export type TActionModule = REGISTER_MODULE

type MODULES_SERVICE_TYPE = 'ModulesService'
type EVENTS_SERVICE = 'EventsService'
export type TMessageType = MODULES_SERVICE_TYPE | EVENTS_SERVICE

export interface ICalledEvent {
  type: EVENTS_SERVICE,
  action: CALL,
  data: {
    data: {
      name: string
      data: object
    }
  }
}

export interface IRegisterMessage {
  type: MODULES_SERVICE_TYPE,
  data: {
    action: REGISTER_MODULE,
    data: {
      name: string,
      uuid: string,
    }
  }
}

export type THandlerRegister = (message: IRegisterMessage) => void