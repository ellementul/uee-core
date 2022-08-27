const { StateWithLoading } = require("./state")

class DBModule extends UEEStateModule {
  constructor ({...args}) {
    super({...args})

    this.type = "Store"
    this.state = new StateWithLoading
  }

  onLoad() {

  }

  saveModuleInDB() {

  }

  requestToLoadModule() {

  }
}