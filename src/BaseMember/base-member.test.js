const { BaseMember } =  require("./base-member")
const { TestProvider } =  require("../Provider/test-class")

describe("Abstract Module Test", () => {
  let ueeModule
  const dispatcher = new TestProvider()
  
  const mockSendEvent = jest.fn()
  const mockTestEvent = jest.fn()

  const typeEvent = {
    name: "testEvent",
    payloadType: {
      system: "Testing"
    },
    tags: ["system"]
  }

  it("Inccorect extends", () => {
    class IncorrectMember extends BaseMember {}

    const inccorectModule = new IncorrectMember
    expect(() => {
      inccorectModule.setDispatcher(dispatcher)
    }).toThrow("type")
  })

  class TestMember extends BaseMember {
    get type() {
      return "TestType"
    }

    testEvent () {
      mockTestEvent();
    }
  }

  it("Constructor", () => {
    
    const ueeModule = new TestMember({ isSaveEventsAfterBuild: true })

    expect(ueeModule).toBeDefined()

    // Mocking recive events
    ueeModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent
  })

  describe("Getting events", () => {
    it("Get event throuth method", () => {

      const ueeModule = new TestMember({ isSaveEventsAfterBuild: true })

      ueeModule.setDispatcher(dispatcher)
      dispatcher.sendEvent = mockSendEvent

      ueeModule.defEvents({
        testEvent: typeEvent
      })

      dispatcher.recieveEvent({
        name: "testEvent",
        payload: {
          system: "Testing"
        },
        tags: ["system"]
      })

      expect(mockTestEvent).toHaveBeenCalled()
    })

    it("DefEventOn method", () => {
      const ueeModule = new TestMember({ isSaveEventsAfterBuild: true })

      ueeModule.setDispatcher(dispatcher)
      dispatcher.sendEvent = mockSendEvent
      
      const callback = jest.fn()
      ueeModule.defEventNow({ event: { name: "testTwoEvent" }, callback })

      dispatcher.recieveEvent({
        name: "testTwoEvent",
        payload: "Somethig payload"
      })

      expect(callback).toHaveBeenCalledWith("Somethig payload")
    })
  })
})