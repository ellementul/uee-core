const { UEEDispatcher } = require("../UEEDispatcher")
const { UEERootModule } = require("../UEEModule/meta-module")
const { SystemInterface } = require("../UEESystems/Interfaces/system-interface")
const { UEEManager } = require("./index")

describe("", () => {
  const dispatcher = new UEEDispatcher
  let manager

  const testSystem = new SystemInterface({
    name: "TestSystem",
    events: [
      { name: "testSystemEventOne" }
    ],
    modules: [
      { name: "TestModule", type: "TestType" }
    ]
  })

  describe("Inccorect call constructor", () => {
    it("Without dispatcher", () => {
      expect( 
        () => manager = new UEEManager
      ).toThrow("dispatcher")
    })

    it("Without system", () => {
      expect( 
        () => manager = new UEEManager({ dispatcher })
      ).toThrow("systems have to be defined")
    })
  })

  it("Constructor", () => {
    manager = new UEEManager({ dispatcher, systems: [testSystem] })
    manager.initRootModule(UEERootModule)

    expect(manager.rootModule).toBeDefined()
  }) 
})