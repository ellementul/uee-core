import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, SYSTEN_READY_EVENT_NAME, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEESystemsModule } from "../systems-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"

describe("System Module Test", () => {
  let systemModule
  const dispatcher = new UEEDispatcher()
  const mockSendEvent = jest.fn()

  const testSystem = "SomethingSystem"
  const testEvent = { name: "testEvent", payloadType: { system: testSystem } }
  class TestModule extends UEESystemsModule {
      constructor () {
        super()

        this.onStart = jest.fn()
        this.testEvent = jest.fn()
        this.addDependsOnSystems([testSystem])
        this.defEvents([testEvent])
      }
  }

  it("Constructor", () => {
    systemModule = new TestModule

    expect(systemModule).toBeDefined()
    expect(systemModule.state).toBeDefined()
    expect(systemModule.onStart).toBeDefined()

    // Mocking recive events
    systemModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent
  })

  describe("Change state", () => {

    it("Saved events", () => {
      systemModule.testEvent.mockImplementation(event => expect(event).toEqual(
        { system: "SomethingSystem" }
      ))

      dispatcher.recieveEvent({
        name: testEvent.name,
        payload: testEvent.payloadType
      })
    })

    it("Running", () => {
      dispatcher.recieveEvent({
        name: SYSTEN_READY_EVENT_NAME,
        payload: {
          system: manageModuleSystem, 
          entity: testSystem
        }
      })

      expect(systemModule.onStart).toHaveBeenCalled()
    })
  })
})