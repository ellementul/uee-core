const { BaseMember } =  require("./base-member")
const { Provider } =  require("../Provider")

describe("Abstract Module Test", () => {
  let ueeModule
  const dispatcher = new Provider()
  
  const mockSendEvent = jest.fn()
  const mockTestEvent = jest.fn()
  class IncorrectMember extends BaseMember {}
  class TestMember extends BaseMember {
    constructor ({ ...args }) {
      super({ ...args });
      this.defEvents([
        {
          name: "testEvent",
          payloadType: {
            system: "Testing"
          },
          tags: ["system"]
        }
      ])
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