const { UEEModule } = require("./abstract-module.js")
const { State, STATES_CONSTATS } = require("./state.js")
const { STATE_EVENT_NAME_CONSTATS, moduleManagerSystem } = require("../UEESystems/modules-manager-system.js")

class UEEStateModule extends UEEModule {

  constructor({ isSaveEventsAfterBuild=false,  ...args } = {}) {
    super({...args});

    this.isSaveEventsAfterBuild = isSaveEventsAfterBuild;
    
    if(isSaveEventsAfterBuild)
      this.savedEvents = [];

    this.state = new State

    const stateEvents = Object.values(moduleManagerSystem.events)
    .filter( event => 
      Object.values(STATE_EVENT_NAME_CONSTATS).includes(event.name)
      && event.name !==STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE
    )
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

  isRun () {
    return (this.state.getValue() === STATES_CONSTATS.RUNNING || this.state.getValue() === STATES_CONSTATS.READONLY)
  }

  //EVENTS
  sendUpdateStateEvent () {
    const newEvent = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE],
      payload: { 
        state: this.state.getValue(), 
        entity: this.uuid,
        moduleType: this.type,
      }
    })

    this.sendEvent(newEvent)
  }

  _wrapAyncOn (method, args, finishedMethod) {
    if(typeof this[method] === 'function') {
      const res = this[method](args)

      if(res instanceof Promise)
        res.then(() => this[finishedMethod]()).catch(error => { throw error })
      else
        this[finishedMethod]()
    }
    else {
      this[finishedMethod]()
    }
  }

  _build () {
    this._wrapAyncOn("onBuild", {}, "sendUpdateStateEvent")
  }

  _load ({ data }) {
    this.state.load()
    this._wrapAyncOn("onLoad", { data }, "sendUpdateStateEvent")
  }

  _run () {
    this.state.run()
    this._wrapAyncOn("onStart", {}, "_afterRun")
  }

  _onlyRead () {
    this.state.onlyread()
    this._wrapAyncOn("onOnlyRead", {}, "_afterRun")
  }

  _afterRun () {
    if(this.isSaveEventsAfterBuild) {
      this.savedEvents.forEach( event => super.recieveEvent(event))
      this.savedEvents = []
    }

    this.sendUpdateStateEvent()
  }

  _sleep () {
    this.state.sleep()
    this._wrapAyncOn("onOnlyRead", {}, "sendUpdateStateEvent")
  }

  _stop () {
    this.state.stop()
    this._wrapAyncOn("onStop", {}, "sendUpdateStateEvent")
  }

}

module.exports = { UEEStateModule }