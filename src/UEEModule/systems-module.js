import { manageModuleSystem, SYSTEN_READY_EVENT_NAME } from "../UEEManager/constants";
import { UEEStateModule } from "./state-module";

export class UEESystemsModule extends UEEStateModule {
  constructor({ ...args } = {}) {
    super({isSaveEventsAfterBuild: true, ...args});

    this._dependsOnSystems = [];
    this._systemsIsReady = [];

    const defindingEvents = this._dependsOnSystems.map(system => {
      return { name: SYSTEN_READY_EVENT_NAME, payloadType: { system: manageModuleSystem, entity: system }}
    });

    this.defEvents(defindingEvents)
  }

  addDependsOnSystems(dependsOnSystems = []) {
    if(dependsOnSystems.every(system => this._dependsOnSystems.includes(system)))
      throw new Error(`This ${system} system is defined as depenedice in this module`)

    this._dependsOnSystems.push(...dependsOnSystems)
  }

  areReadyAllSystems() {
    return this._dependsOnSystems.every(system => this._systemsIsReady.includes(system))
  }

  systemIsReady({ entity: system }) {
    this._systemsIsReady.push(system)

    if(this.areReadyAllSystems())
      super.run();
  }
}