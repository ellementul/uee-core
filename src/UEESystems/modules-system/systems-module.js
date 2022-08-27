const { moduleManagerSystem, SYSTEN_READY_EVENT_NAME } = require("./modules-manager-system.js")
const { SystemInterface } = require("../Interfaces/system-interface.js")
const { UEEStateModule } = require("./state-module.js")

class UEESystemsModule extends UEEStateModule {
  constructor({ systemInterfaces, systemEvents = [], ...args } = {}) {
    super({ isSaveEventsAfterBuild: true, ...args})

    if(!Array.isArray(systemInterfaces) || systemInterfaces.length === 0)
      throw new Error("The systems isn't defined!")

    if(systemInterfaces.some( system => !(system instanceof SystemInterface) ))
      throw new Error(`The systems have to extend SystemInterface!`)

    this._dependsOnSystems = []
    this._systemsIsReady = []
    this.defDependensSystemEventAboutReady(systemInterfaces)
    const envetsWithoutCallback = this.checkAndDefSystemEvents(systemInterfaces, systemEvents)

    this.defEvents(envetsWithoutCallback)
  }

  defDependensSystemEventAboutReady(systemInterfaces) {
    return systemInterfaces.map(system => {
      this._dependsOnSystems.push(system.name)
      const event = { name: SYSTEN_READY_EVENT_NAME, payloadType: { system: moduleManagerSystem.name, entity: system.name }, tags: ["system", "entity"]}
      this.defEventNow({ event, callback: payload => this.__systemIsReady(payload)})
    })
  }

  checkAndDefSystemEvents(systemInterfaces, systemEvents) {
    return systemEvents.filter(event => {
      const isCallback = (typeof event.callback === "function")
      const systemsOfEvent = systemInterfaces.filter(system => system.isContentingEvent(isCallback ? event.event : event))

      if(systemsOfEvent.length === 0)
        throw new Error(`This event ${event.name} isn't contented any defined system!`)

      if(isCallback)
        this.defEventNow(event)

      return !isCallback
    })
  }

  areReadyAllSystems() {
    return this._dependsOnSystems.every(system => this._systemsIsReady.includes(system))
  }

  __systemIsReady({ entity: system }) {
    this._systemsIsReady.push(system)

    if(this.areReadyAllSystems())
      super._run();
  }
}

module.exports = { UEESystemsModule }