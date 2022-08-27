const { UEEModule } = require ("./abstract-module.js")
const { STATE_EVENT_NAME_CONSTATS, moduleManagerSystem, SYSTEN_READY_EVENT_NAME } = require("../UEESystems/modules-manager-system.js");
const { SystemInterface } = require("../UEESystems/Interfaces/system-interface.js");
const { STATES_CONSTATS } = require("./state.js");

class UEERootModule extends UEEModule {

  constructor({ systems, ...args } = {}) {
    super({...args});

    this.type = "rootModule"
    

    if(!Array.isArray(systems))
      throw new Error("The systems have to be defined!")

    if(systems.some(system => !(system instanceof SystemInterface)))
      throw new Error("Every system has to extend SystemInterface!")

    this._systems = []
    this.defSystems(systems)

    this.defEventNow({ 
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE], 
      callback: payload => this._updatingStateModule(payload)
    })
  }

  defSystems(systems) {
    systems.forEach(({ name, modulesByTypes }) => {
      if(this._systems.some(definedSystem => definedSystem.name === name))
        throw new Error(`The repeated defining of system: ${name}`)

        this._systems.push({ name, modules: modulesByTypes })
    });
  }

  _updatingStateModule({ moduleType, state: status, entity: moduleUuid }) {
    const systems = this._systems.filter(system => {
      if(system.modules[moduleType]) {
        system.modules[moduleType].status = status
        return true
      }

      return false
    })

    this._checkSystemsStatus(systems)
  }

  _checkSystemsStatus(systems) {
    systems.forEach( ({ name: systemName, modules }) => {
      if(Object.values(modules).every(({ status }) => status === STATES_CONSTATS.RUNNING )) {
        const { name, payload, tags } = moduleManagerSystem.createNewEvent({ event: { name: SYSTEN_READY_EVENT_NAME } })
        this.sendEvent({
          name,
          payload: { entity: systemName, ...payload },
          tags: [ "entity", ...tags ]
        })
      }
    })
  }

}

module.exports = { UEERootModule }
