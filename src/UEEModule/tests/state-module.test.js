import { jest } from '@jest/globals'
import { UEEStateModule } from "../state-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"
import {STATE_EVENT_NAME_CONSTATS, moduleManagerSystem, updateModuleStateAction } from "../../UEESystems/modules-manager-system.js";

describe("State Module Test", () => {
  let stateModule
  const dispatcher = new UEEDispatcher()
  const mockSendEvent = jest.fn()

  class TestModule extends UEEStateModule {
      constructor ({ ...args }) {
        super({ ...args });
        this.onBuild = jest.fn(async () => "Promise")
        this.onLoad = jest.fn()
        this.onStart = jest.fn()

        this.testEvent = jest.fn()

        this.defEvents([
          { name: "testEvent", payloadType: { system: "Testing" }}
        ])
      }

      get type () {
        return "TestStateType"
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
      expect(stateModule.isRun()).toBe(false)
    })

    it("Building", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name: STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: moduleManagerSystem.name, 
          action: updateModuleStateAction, 
          entity: stateModule.uuid,
          state: "BUILDED",
          typeModule: "TestStateType"
        },
        tags: ["action", "system"]
      }))

      const event = moduleManagerSystem.createNewEvent({
        event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.BUILD]
      })
      event.tags.push("entity")
      event.payload.entity = stateModule.uuid
      dispatcher.recieveEvent(event)

      expect(stateModule.onBuild.mock.calls.length).toBe(1)
      expect(stateModule.isRun()).toBe(false)
    })

    it("Loading", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name:STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: moduleManagerSystem.name, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "LOADED",
          typeModule: "TestStateType"
        },
        tags: ["action", "system"]
      }))
      const event = moduleManagerSystem.createNewEvent({
        event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.LOAD]
      })
      event.tags.push("entity")
      event.payload.entity = stateModule.uuid
      event.payload.data = "Somethin Store"
      dispatcher.recieveEvent(event)

      expect(stateModule.onLoad.mock.calls.length).toBe(1)
      expect(stateModule.onLoad.mock.lastCall).toEqual([{ data: "Somethin Store" }])
      expect(stateModule.isRun()).toBe(false)
    })

    it("Running", () => {
      mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
        name:STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
        payload: { 
          system: moduleManagerSystem.name, 
          action: updateModuleStateAction,
          entity: stateModule.uuid,
          state: "RUNNING",
          typeModule: "TestStateType"
        },
        tags: ["action", "system"]
      }))
      const event = moduleManagerSystem.createNewEvent({
        event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.RUN]
      })
      event.tags.push("entity")
      event.payload.entity = stateModule.uuid
      dispatcher.recieveEvent(event)

      expect(stateModule.onStart.mock.calls.length).toBe(1)
      expect(stateModule.isRun()).toBe(true)
    })

    it("Repeat run (expect error)", () => {

      expect(() => {
        const event = moduleManagerSystem.createNewEvent({
          event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.RUN]
        })
        event.tags.push("entity")
        event.payload.entity = stateModule.uuid
        dispatcher.recieveEvent(event)
      }).toThrow('Uncorrectly state')
      
    })
  })
})