import { UEEModule } from "./abstract-module.js";
import { State, STATES_CONSTATS } from "./state.js";
import { EVENT_NAME_CONSTATS, moduleManagerSystem } from "../UEESystems/modules-manager-system.js";

export class UEEStateModule extends UEEModule {

  constructor({ isSaveEventsAfterBuild=false,  ...args } = {}) {
    super({...args});

    this.isSaveEventsAfterBuild = isSaveEventsAfterBuild;
    
    if(isSaveEventsAfterBuild)
      this.savedEvents = [];

    this.state = new State

    const stateEvents = Object.values(moduleManagerSystem.events)
    .filter( event => event.name !== EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE)
    .map( ({ name, payloadType, tags }) => {
      tags.push("entity")
      payloadType.entity = this.uuid

      return { name, payloadType, tags }
    })
    this.defEvents(stateEvents)
  }

  sendEvent ({ name, payload }) {
    if(payload?.system === moduleManagerSystem.name) {
      super.sendEvent({ name, payload })
      return
    }
    
    if(this.state.getValue() === STATES_CONSTATS.RUNNING) {
      super.sendEvent({ name, payload })
      return
    }

    throw new Error("Module isn't running!")
  }

  recieveEvent ({ name, payload }) {
    if(payload?.system === moduleManagerSystem.name) {
      super.recieveEvent({ name, payload })
      return
    }
    
    if(this.state.getValue() === STATES_CONSTATS.RUNNING || this.state.getValue() === STATES_CONSTATS.READONLY) {
      super.recieveEvent({ name, payload })
      return
    }

    if(this.isSaveEventsAfterBuild)
      this.savedEvents.push({ name, payload })
    else
      throw new Error("Module isn't running!")
  }

  //EVENTS
  sendUpdateStateEvent () {
    const newEvent = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE],
      payload: { state: this.state.getValue(), entity: this.uuid}
    })

    this.sendEvent(newEvent)
  }

  _build ({ moduleType }) {
    if(typeof this.onBuild === 'function')
      this.onBuild({ moduleType })

    this.sendUpdateStateEvent()
  }

  _load ({ data }) {
    this.state.load()

    if(typeof this.onLoad === 'function')
      this.onLoad({ data })

    this.sendUpdateStateEvent()
  }

  isRun () {
    return (this.state.getValue() === STATES_CONSTATS.RUNNING || this.state.getValue() === STATES_CONSTATS.READONLY)
  }

  _run () {
    this.state.run()

    if(typeof this.onStart === 'function')
      this.onStart()

    if(this.isSaveEventsAfterBuild) 
      this.savedEvents.forEach( event => super.recieveEvent(event))

    this.sendUpdateStateEvent()
  }

  _onlyRead () {
    this.state.onlyread()

    if(typeof this.onOnlyRead === 'function')
      this.onOnlyRead()
  }

  _sleep () {
    this.state.sleep()

    if(typeof this.onSleep === 'function')
      this.onSleep()

    this.sendUpdateStateEvent()
  }

  _stop () {
    delete this.store
    if(typeof this.onStop === 'function')
      this.onStop()
  }

}