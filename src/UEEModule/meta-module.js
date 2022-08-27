const { UEEModule } = require ("./abstract-module.js")
const { STATE_EVENT_NAME_CONSTATS, moduleManagerSystem } = require("../UEESystems/modules-manager-system.js")

class UEERootModule extends UEEModule {

  constructor({ ...args } = {}) {
    super({...args});

    this.modules = new Set
    this.systems = new Set
  }

  defSystems(systems) {

  }

}

module.exports = { UEERootModule }
