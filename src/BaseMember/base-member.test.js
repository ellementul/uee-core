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

  class IncorrectMember extends BaseMember {}
  class TestMember extends BaseMember {
    constructor ({ ...args }) {
      super({ ...args });
      this.defEvents({
        testEvent: typeEvent
      })
    }

    get type() {
      return "TestType"
    }

    testEvent () {
      mockTestEvent();
    }
  }

  it("Inccorect extends", () => {
    const inccorectModule = new IncorrectMember
    expect(() => {
      inccorectModule.setDispatcher(dispatcher)
    }).toThrow("type")
  })

  it("Constructor", () => {
    ueeModule = new TestMember({ isSaveEventsAfterBuild: true })

    expect(ueeModule).toBeDefined()

    // Mocking recive events
    ueeModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent
  })

  describe("Getting events", () => {
    it("Get event throuth method", () => {

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