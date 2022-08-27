const { SystemInterface } = require("../Interfaces/system-interface")

const SavingOfModuleAction = "Saving module..."
const LoadingOfModuleAction = "Saving module..."
const STORE_EVENT_NAMES = {
  saveModuleInDB: "saveModuleInDB",
  requestToLoadModule: "requestToLoadModule"
}
const storeSystem = new SystemInterface({
  name: "StoreSystem",
  events: [
    {
      name: STORE_EVENT_NAMES.saveModuleInDB, 
      payloadType: {
        action: SavingOfModuleAction,
        typeEntity: "module"
      }, 
      tags: ["action", "typeEntity"]
    },
    {
      name: STORE_EVENT_NAMES.requestToLoadModule,
      payloadType: {
        action: LoadingOfModuleAction,
        typeEntity: "module"
      },
      tags: ["action", "typeEntity"]
    }
  ],
  modules: [
    { name: "StoreModule", type: "Store" },
  ]
})

module.exports = { STORE_EVENT_NAMES, storeSystem }