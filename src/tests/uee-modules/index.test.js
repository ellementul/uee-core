import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEEStateModule } from "../../UEEModule/state-module.js"
import UEEDispatcher from "../../UEEDispatcher/index.js"

describe("State Module Test", () => {
  let stateModule
  const dispatcher = new UEEDispatcher()
  const reciveEvent = jest.fn()

  class TestModule extends UEEStateModule {
      constructor () {
        super();
        this.onBuild = jest.fn()
        this.onLoadStore = jest.fn()
        this.onStart = jest.fn()
      }
  }

  it("Constructor", () => {
    stateModule = new TestModule()

    expect(stateModule).toBeDefined()
    expect(stateModule.state).toBeDefined()

    stateModule.setDispatcher(dispatcher)

    // Mocking recive events
    dispatcher.onRecieveEvent(reciveEvent)
  })

  describe("Change state", () => {

    it("Building", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction, 
          entity: "BUILDED"
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
          entity: "LOADED"
        }
      }))

      stateModule.recieveEvent({
        name: EVENT_NAME_CONSTATS.LOAD,
        payload: {
          system: manageModuleSystem,
          action: changeStateOfModuleAction,
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onLoadStore.mock.calls.length).toBe(1)
    })

    it("Running", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: manageModuleSystem, 
          action: updateModuleStateAction, 
          entity: "RUNNING"
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

    it("Saving", () => {
      reciveEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: EVENT_NAME_CONSTATS.SAVE_MODULE_STORE, 
        payload: { 
          system: 'SomeSystem',
          action: 'SomeSaveActon', 
          entity: stateModule.uuid
        }
      }))

      stateModule.recieveEvent({
        name: EVENT_NAME_CONSTATS.SAVE,
        payload: {
          system: 'SomeSystem',
          action: changeStateOfModuleAction,
          saveAction: 'SomeSaveActon',
          entity: stateModule.uuid
        }
      })

      expect(stateModule.onStart.mock.calls.length).toBe(1)
    })
  })
})