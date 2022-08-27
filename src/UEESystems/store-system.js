const { SystemInterface } = require("./Interfaces/system-interface")

const SavingOfModuleAction = "Saving module..."
const LoadingOfModuleAction = "Saving module..."
const storeSystem = new SystemInterface({
  name: "StoreSystem",
  events: [
    {
      name: "saveModuleInDB", 
      payloadType: {
        action: SavingOfModuleAction,
        typeEntity: "module"
      }, 
      tags: ["action", "typeEntity"]
    },
    {
      name: "requestToLoadModule",
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