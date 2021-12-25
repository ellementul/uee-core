import { ICalledEvent, THandlerRegister } from './types'

import EventEmitter from 'events'
import { UEEModule } from '../UEEModule'

const registeringModule = Symbol()
const subscribingEvent = Symbol()
const callingEvent = Symbol()

class UEEnviroment {
  private emitter = new EventEmitter

  public runModule (module: UEEModule): void {

  }

  private registerModule (moduleUid, moduleName) {
    
  }

  public onRegisterModule (cb: THandlerRegister) {
    this.emitter.addListener(registeringModule, cb)
  }


}