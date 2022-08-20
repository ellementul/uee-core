import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEEStateModule } from "../state-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"

describe("State Module Test", () => {
  let stateModule
  const dispatcher = new UEEDispatcher()
  const reciveEvent = jest.fn()

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

    stateModule.setDispatcher(dispatcher)

    // Mocking recive events
    dispatcher.onRecieveEvent(reciveEvent)
  })

  describe("Change state", () => {
    it("Saved messages", () => {
      stateModule.testEvent.mockImplementation(event => expect(event).toEqual(
        { system: "Testing" }
      ))

      stateModule.recieveEvent({
        name: "testEvent",
        payload: {
          system: "Testing"
        }
      })
    })

    it("Building", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction, 
          entity: stateModule.uuid,
          state: "BUILDED",
        }
      }))

      stateModule.recieveEvent({
        name: EVENT_NAME_CONSTATS.BUILD,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onBuild.mock.calls.length).toBe(1)
    })

    it("Loading", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "LOADED"
        }
      }))

      stateModule.recieveEvent({
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
    })

    it("Running", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "RUNNING"
        }
      }))

      stateModule.recieveEvent({
        name: EVENT_NAME_CONSTATS.RUN,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onStart.mock.calls.length).toBe(1)
    })

    it("Repeat run (expect error)", () => {

      expect(() =>
        stateModule.recieveEvent({
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