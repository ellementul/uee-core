const { Provider } = require("../../Provider")
const { UEERootModule } = require("./root-module")
const { UEEStateModule } = require("./state-module")
const { UEESystemsModule } = require("./systems-module")
const { SystemInterface } = require("../Interfaces/system-interface")
const { UEEManager } = require("../../UEEManager/index")

describe("", () => {
  const dispatcher = new Provider
  let manager
  const mockSystemModuleOnStart = jest.fn()
  const mockTestSystemEventThree = jest.fn()

  const testSystem = new SystemInterface({
    name: "TestSystem",
    events: [
      { name: "testSystemEventOne" }
    ],
    modules: [
      { name: "TestModule", type: "TestType" }
    ]
  })

  class TestModule extends UEEStateModule {
    get type () {
      return testSystem.modules.TestModule.type
    }
  }

  class TestSystemModule extends UEESystemsModule {
    get type () {
      return "TestSystemModule"
    }

    onStart() {
      mockSystemModuleOnStart()
    }
  }

  const testModule = new TestModule
  const systemModule = new TestSystemModule({
    systemInterfaces: [testSystem],
    systemEvents: [
      { event: testSystem.events.testSystemEventOne, callback: mockTestSystemEventThree },
    ]
  })

  describe("Inccorect call constructor", () => {
    it("Without dispatcher", () => {
      expect( 
        () => new UEEManager
      ).toThrow("dispatcher")
    })

    it("Without system", () => {
      expect( 
        () => new UEERootModule
      ).toThrow("systems have to be defined")
    })

    it("Without system", () => {
      expect( 
        () => new UEERootModule({ systems: [testSystem, testSystem] })
      ).toThrow("repeated defining")
    })
  })

  it("Constructor Manager", () => {
    manager = new UEEManager({ dispatcher })
  })

  it("Constructor Root Module", () => {

    manager.initRootModule(new UEERootModule({ systems: [testSystem] }))
    manager.initModule(testModule)
    manager.initModule(systemModule)
  })

  it("Run module", () => {
    manager.runModule(testModule)

    expect(mockSystemModuleOnStart).toHaveBeenCalled()
  })
})