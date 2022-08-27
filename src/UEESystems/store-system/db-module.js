const { StateWithLoading } = require("../modules-system/state")
const { UEEStateModule } = require("../modules-system/state-module")

class UEEDBModule extends UEEStateModule {
  constructor ({ db, ...args}) {
    super({ ...args })

    this.type = "Store"
    this.state = new StateWithLoading
    this.db = db
  }

  async onLoad() {
    await this.db.connection()
  }

  saveModuleInDB() {

  }

  requestToLoadModule() {

  }
}

module.exports = { UEEDBModule }