const { moduleManagerSystem, STATE_EVENT_NAME_CONSTATS } = require("../modules-system/modules-manager-system")
const { StateWithLoading } = require("../modules-system/state")
const { UEEStateModule } = require("../modules-system/state-module")
const { UEEDBAdapter } = require("./db-adapter")
const { storeSystem, STORE_EVENT_NAMES } = require("./store-system")

class UEEDBModule extends UEEStateModule {
  constructor ({ db, ...args}) {
    super({ ...args })

    this.type = "Store"
    this.state = new StateWithLoading

    if(!(db instanceof UEEDBAdapter))
      throw new Error("The db has to be instance of AdapterDB!") 

    this._db = db

    this.defEventNow({ event: storeSystem.events[STORE_EVENT_NAMES.saveModuleInDB], callback: payload => this._saveModuleInDB(payload) })
    this.defEventNow({ event: storeSystem.events[STORE_EVENT_NAMES.requestToLoadModule], callback: payload => this._requestToLoadModule(payload) })
  }

  async onLoad() {
    await this._db.connection()
  }

  _saveModuleInDB({ typeEntity, entity }) {
    this._db.saveEntity({ typeEntity, entity })
  }

  _requestToLoadModule({ typeEntity, entity: uuid }) {
    this._db.getEntity({ typeEntity, uuid })
    .then(entity => this._loadModuleByUuid(uuid, entity))
  }

  _loadModuleByUuid(moduleUuid, entity) {
    const event = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.LOAD]
    })

    event.tags.push("entity")
    event.payload.entity = moduleUuid
    event.payload.data = entity

    this.sendEvent(event)
  }
}

module.exports = { UEEDBModule }