import { jest } from '@jest/globals'
import { changeStateOfModuleAction, EVENT_NAME_CONSTATS, manageModuleSystem, SYSTEN_READY_EVENT_NAME, updateModuleStateAction } from "../../UEEManager/constants.js"
import { UEESystemsModule } from "../systems-module.js"
import { UEEDispatcher } from "../../UEEDispatcher/index.js"
import { SystemInterface } from '../../UEESystems/Interfaces/system-interface.js'

describe("System Module Test", () => {
  let systemModule
  const dispatcher = new UEEDispatcher()
  const mockSendEvent = jest.fn()
  const mockTestSystemEventTwo = jest.fn()
  const mockTestSystemEventThree = jest.fn()

  const testSystem = new SystemInterface({
    name: "TestSystem",
    events: [
      { name: "testSystemEventOne" },
      { name: "testSystemEventTwo" },
      { name: "testSystemEventThree" }
    ]
  })
  const anotherTestSystem = new SystemInterface({
    name: "TestSystem",
    events: [
      { name: "testSystemEventOne" },
      { name: "testSystemEventTwo" },
      { name: "testSystemEventThree" }
    ]
  })
  class TestModule extends UEESystemsModule {
      constructor ({...args}) {
        super({...args})

        this.onStart = jest.fn()
      }

      testSystemEventTwo() {
        mockTestSystemEventTwo()
      }
  }

  it("Inccorect calls Constructor", () => {
    expect(() => new TestModule({})).toThrow('systems')
    expect(() => new TestModule({
      systemInterfaces: []
    })).toThrow('systems')
    expect(() => new TestModule({
      systemInterfaces: [{}]
    })).toThrow('SystemInterface')
    expect(() => new TestModule({
      systemInterfaces: [testSystem],
      systemEvents: [anotherTestSystem.events.testSystemEventOne]
    })).toThrow('contented')
  })

  it("Constructor", () => {
    systemModule = new TestModule({
      systemInterfaces: [testSystem, anotherTestSystem],
      systemEvents: [
        testSystem.events.testSystemEventTwo,
        { event: testSystem.events.testSystemEventThree, callback: mockTestSystemEventThree },
        anotherTestSystem.events.testSystemEventTwo
      ]
    })

    expect(systemModule).toBeDefined()
    expect(systemModule.state).toBeDefined()
    expect(systemModule.onStart).toBeDefined()

    // Mocking recive events
    systemModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent
  })

  describe("Change state", () => {

    it("Saved events", () => {
      const callback = jest.fn(event => expect(event).toEqual(
        { system: "SomethingSystem" }
      ))

      systemModule.defEventNow({ event: { name: "testTwoEvent" }, callback })
      dispatcher.recieveEvent({ name: "testTwoEvent", payload: {"system": "SomethingSystem"} })
    })

    it("Running", () => {
      expect(systemModule.isRun()).toBe(false)

      dispatcher.recieveEvent({
        name: SYSTEN_READY_EVENT_NAME,
        payload: {
          system: manageModuleSystem,
          entity: testSystem.name 
        },
        tags: ["system", "entity"]
      })

      expect(systemModule.onStart).toHaveBeenCalled()
    })

    it("System Event", () => {
      const event = testSystem.events.testSystemEventTwo
      event.payload = event.payloadType
      dispatcher.recieveEvent(event)

      expect(mockTestSystemEventTwo).toHaveBeenCalled()
    })

    it("Other System Event with the same name", () => {
      const event = anotherTestSystem.events.testSystemEventTwo
      event.payload = event.payloadType
      dispatcher.recieveEvent(event)

      expect(mockTestSystemEventTwo.mock.calls.length).toBe(2)
    })

    it("Event defined with callback", () => {
      const event = testSystem.events.testSystemEventThree
      event.payload = event.payloadType
      dispatcher.recieveEvent(event)

      expect(mockTestSystemEventThree).toHaveBeenCalled()
    })
  })
})