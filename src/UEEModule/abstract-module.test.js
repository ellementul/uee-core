const { UEEModule } =  require("./abstract-module")
const { UEEDispatcher } =  require("../UEEDispatcher")

describe("Abstract Module Test", () => {
  let ueeModule
  const dispatcher = new UEEDispatcher()
  
  const mockSendEvent = jest.fn()
  const mockTestEvent = jest.fn()
  class IncorrectModule extends UEEModule {}
  class TestModule extends UEEModule {
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
    const inccorectModule = new IncorrectModule
    expect(() => {
      inccorectModule.setDispatcher(dispatcher)
    }).toThrow("type")
  })

  it("Constructor", () => {
    ueeModule = new TestModule({ isSaveEventsAfterBuild: true })

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