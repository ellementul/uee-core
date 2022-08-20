import { UEEModule } from "./abstaract-module.js";
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, saveModuleStoreAction, updateModuleStateAction } from "../UEEManager/constants.js";
import { State, STATES_CONSTATS } from "./state.js";

export class UEEStateModule extends UEEModule {

  constructor(...args) {
    super(...args);

    this.state = new State
  }

  defEvents () {
    return [
      { name: EVENT_NAME_CONSTATS.BUILD, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } },
      { name: EVENT_NAME_CONSTATS.LOAD, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } },
      { name: EVENT_NAME_CONSTATS.RUN, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } },
      { name: EVENT_NAME_CONSTATS.ONLYREAD, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } },
      { name: EVENT_NAME_CONSTATS.SLEEP, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } },
      { name: EVENT_NAME_CONSTATS.STOP, payloadType: { system: manageModuleSystem, action: changeStateOfModuleAction, entity: this.uuid } }
    ]
  }

  sendEvent ({ name, payload: { system } }) {
    if(payload.system === manageModuleSystem) {
      super.sendEvent({ name, payload })
      return
    }
    
    if(this.state.getValue() === STATES_CONSTATS.RUNNING) {
      super.sendEvent({ name, payload })
      return
    }

    if(this.state.getValue() === STATES_CONSTATS.READONLY) {
      super.sendEvent({ name, payload })
      return
    }

    throw new Error("Module isn't running!")
  }

  recieveEvent ({ name, payload }) {
    if(payload.system === manageModuleSystem) {
      super.recieveEvent({ name, payload })

      return
    }
    
    if(this.state.getValue() === STATES_CONSTATS.RUNNING) {
      super.recieveEvent({ name, payload })
      return
    }

    if (this.state.getValue() === STATES_CONSTATS.READONLY) {
      if (name === EVENT_NAME_CONSTATS.SAVE_MODULE_STORE) {
        super.recieveEvent({ name, payload })
        return
      }
    }

    throw new Error("Module isn't running!")
  }

  sendUpdateStateEvent () {
    this.sendEvent({ 
      name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
      payload: {
        system: manageModuleSystem, 
        action: updateModuleStateAction, 
        entity: this.state.getValue() 
      } 
    })
  }

  build ({ moduleType }) {
    if(typeof this.onBuild === 'function')
      this.onBuild({ moduleType })

    this.sendUpdateStateEvent()
  }

  load ({ data }) {
    this.state.load()

    if(typeof this.onLoad === 'function')
      this.onLoad({ data })

    this.sendUpdateStateEvent()
  }

  run () {
    this.state.run()

    if(typeof this.onStart === 'function')
      this.onStart()

    this.sendUpdateStateEvent()
  }

  onlyRead () {
    this.state.onlyread()

    if(typeof this.onOnlyRead === 'function')
      this.onOnlyRead()
  }

  sleep () {
    this.state.sleep()

    if(typeof this.onSleep === 'function')
      this.onSleep()

    this.sendUpdateStateEvent()
  }

  stop () {
    delete this.store
    if(typeof this.onStop === 'function')
      this.onStop()
  }

}