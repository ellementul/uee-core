const { UEEDispatcher } = require("../../UEEDispatcher")
const { STATE_EVENT_NAME_CONSTATS, moduleManagerSystem, updateModuleStateAction } = require("../modules-system/modules-manager-system")
const { UEEDBModule } = require("./db-module")
const { UEEDBAdapter } = require("./db-adapter")
const { storeSystem, STORE_EVENT_NAMES } = require("./store-system")

describe("Test for DB Module", () => {

  let dbModule
  const dispatcher = new UEEDispatcher
  const mockConnection = jest.fn()
  const mockSendEvent = jest.fn()

  class FakeDB extends UEEDBAdapter {

    constructor () {
      super()
      this.DB = {}
    }

    async connection() {
      await mockConnection()
    }

    async saveEntity ({ typeEntity, entity }) {
      if(!this.DB[typeEntity])
        this.DB[typeEntity] = {}

      this.DB[typeEntity][entity.uuid] = entity
    }

    async getEntity ({ typeEntity, uuid }) {
      return this.DB[typeEntity][uuid]
    }

    async getAllEntities ({ typeEntity }) {
      return this.DB[typeEntity]
    }
  }

  it("Constructor and Building", () => {
    dbModule = new UEEDBModule({ db: new FakeDB })

    expect(dbModule).toBeDefined()
    // Mocking recive events
    dbModule.setDispatcher(dispatcher)
    dispatcher.sendEvent = mockSendEvent

    mockSendEvent.mockImplementationOnce(() => {})
    const event = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.BUILD]
    })
    event.tags.push("entity")
    event.payload.entity = dbModule.uuid
    dispatcher.recieveEvent(event)
  })

  it("Innccorect run", () => {
    const event = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.RUN]
    })
    event.tags.push("entity")
    event.payload.entity = dbModule.uuid

    expect(
      () => dispatcher.recieveEvent(event)
    ).toThrow('Uncorrectly state')

  })

  it("Loading", () => {
    mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
      name:STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
      payload: { 
        system: moduleManagerSystem.name, 
        action: updateModuleStateAction,
        entity: dbModule.uuid,
        state: "LOADED",
        moduleType: "Store"
      },
      tags: ["action", "system"]
    }))
    const event = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.LOAD]
    })
    event.tags.push("entity")
    event.payload.entity = dbModule.uuid
    event.payload.data = "Somethin Store"
    dispatcher.recieveEvent(event)

    expect(mockConnection).toHaveBeenCalled()
  })

  it("Running", () => {
    mockSendEvent.mockImplementationOnce(event => expect(event).toEqual({ 
      name:STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE, 
      payload: { 
        system: moduleManagerSystem.name, 
        action: updateModuleStateAction,
        entity: dbModule.uuid,
        state: "RUNNING",
        moduleType: "Store"
      },
      tags: ["action", "system"]
    }))
    const event = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.RUN]
    })
    event.tags.push("entity")
    event.payload.entity = dbModule.uuid
    dispatcher.recieveEvent(event)

    expect(dbModule.isRun()).toBe(true)
  })

  const entity = {
    uuid: "SomethigUUID",
    data: "SomethingData"
  }

  it("Save Entity", () => {
    const savingEvent = storeSystem.createNewEvent({ 
      event: { name: STORE_EVENT_NAMES.saveModuleInDB },
      payload: { entity }
    })
    dispatcher.recieveEvent(savingEvent)

    const eventResult = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.LOAD]
    })
    eventResult.tags.push("entity")
    eventResult.payload.entity = entity.uuid
    eventResult.payload.data = entity

    mockSendEvent.mockImplementationOnce(event => expect(event).toEqual(eventResult))

    const loadingEvent = storeSystem.createNewEvent({ 
      event: { name: STORE_EVENT_NAMES.requestToLoadModule },
      payload: { entity: entity.uuid }
    })
    dispatcher.recieveEvent(loadingEvent)
  })

})