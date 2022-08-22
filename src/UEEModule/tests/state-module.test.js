import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEEStateModule } from "../state-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"

describe("State Module Test", () => {
  let stateModule
  const dispatcher = new UEEDispatcher()
  const mockSendEvent = jest.fn()

  class TestModule extends UEEStateModule {
      constructor ({ ...args }) {
        super({ ...args });
        this.onBuild = jest.fn()
        this.onLoad = jest.fn()
        this.onStart = jest.fn()

        this.testEvent = jest.fn()

        this.defEvents([
          { name: "testEvent", payloadType: { system: "Testing" }}
        ])
      }
  }

  it("Constructor", () => {
    stateModule = new TestModule({ isSaveEventsAfterBuild: true })

    expect(stateModule).toBeDefined()
    expect(stateModule.state).toBeDefined()

    // Mocking recive events
    stateModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent
  })

  describe("Change state", () => {
    it("Saved messages", () => {
      stateModule.testEvent.mockImplementation(event => expect(event).toEqual(
        { system: "Testing" }
      ))

      dispatcher.recieveEvent({
        name: "testEvent",
        payload: {
          system: "Testing"
        }
      })
    })

    it("Building", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction, 
          entity: stateModule.uuid,
          state: "BUILDED",
        }
      }))
      expect(stateModule.isRun()).toBe(false)

      dispatcher.recieveEvent({
        name: EVENT_NAME_CONSTATS.BUILD,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onBuild.mock.calls.length).toBe(1)
      expect(stateModule.isRun()).toBe(false)
    })

    it("Loading", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "LOADED"
        }
      }))

      dispatcher.recieveEvent({
        name: EVENT_NAME_CONSTATS.LOAD,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid,
          data: "Somethin Store"
        }
      })

      expect(stateModule.onLoad.mock.calls.length).toBe(1)
      expect(stateModule.onLoad.mock.lastCall).toEqual([{ data: "Somethin Store" }])
      expect(stateModule.isRun()).toBe(false)
    })

    it("Running", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "RUNNING"
        }
      }))

      dispatcher.recieveEvent({
        name: EVENT_NAME_CONSTATS.RUN,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onStart.mock.calls.length).toBe(1)
      expect(stateModule.isRun()).toBe(true)
    })

    it("Repeat run (expect error)", () => {

      expect(() =>
        dispatcher.recieveEvent({
          name: EVENT_NAME_CONSTATS.RUN,
          payload: {
            system: manageModuleSystem,
            action: changeStateOfModuleAction,
            entity: stateModule.uuid
          }
        })
      ).toThrow('Uncorrectly state')
      
    })
  })
})