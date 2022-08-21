import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, SYSTEN_READY_EVENT_NAME, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEESystemsModule } from "../systems-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"

describe("System Module Test", () => {
  let stateModule
  const dispatcher = new UEEDispatcher()
  const reciveEvent = jest.fn()

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
    stateModule = new TestModule

    expect(stateModule).toBeDefined()
    expect(stateModule.state).toBeDefined()
    expect(stateModule.onStart).toBeDefined()

    stateModule.setDispatcher(dispatcher)

    // Mocking recive events
    dispatcher.onRecieveEvent(reciveEvent)
  })

  describe("Change state", () => {

    it("Saved events", () => {
      stateModule.testEvent.mockImplementation(event => expect(event).toEqual(
        { system: "SomethingSystem" }
      ))

      stateModule.recieveEvent({
        name: testEvent.name,
        payload: testEvent.payloadType
      })
    })

    it("Running", () => {
      stateModule.recieveEvent({
        name: SYSTEN_READY_EVENT_NAME,
        payload: {
          system: manageModuleSystem, 
          entity: testSystem
        }
      })

      expect(stateModule.onStart).toHaveBeenCalled()
    })
  })
})