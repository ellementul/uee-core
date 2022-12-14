const { BaseMember } =  require("./base-member")
const { TestProvider } =  require("../Provider/test-class")

describe("Abstract Module Test", () => {
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
  })

  describe("Getting events", () => {
    
    it("Get event throuth method", () => {

      const event = {
        name: "testEvent",
        payload: {
          system: "Testing"
        },
        tags: ["system"]
      }

      const ueeModule = dispatcher.connectMemeber(TestMember, { isSaveEventsAfterBuild: true })
      ueeModule.defEvents({ testEvent: typeEvent })

      dispatcher.recieveEvent(event)

      expect(mockTestEvent).toHaveBeenCalled()
    })

    it("defEventNow method", () => {
      const callback = jest.fn()
      const event = {
        name: "testTwoEvent",
        payload: "Somethig payload"
      }

      const ueeModule = dispatcher.connectMemeber(TestMember, { isSaveEventsAfterBuild: true })
      ueeModule.defEventNow({ event: { name: "testTwoEvent" }, callback })

      dispatcher.recieveEvent(event)

      expect(callback).toHaveBeenCalledWith("Somethig payload")
    })
  })
})