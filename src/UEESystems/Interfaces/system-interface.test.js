import { SystemInterface } from './system-interface.js'

describe("SystemInterface", () => {
  it("Incorrect calls constructor", () => {
    expect(() => {
      new SystemInterface({})
    }).toThrow('System')

    expect(() => {
      new SystemInterface({
        name: "TestSystem"
      })
    }).toThrow('Events')

    expect(() => {
      new SystemInterface({
        name: "TestSystem",
        events: []
      })
    }).toThrow('Events')

    expect(() => {
      new SystemInterface({
        name: "TestSystem",
        events: [
          { rip: "TestEvent" }
        ]
      })
    }).toThrow('name')

    expect(() => {
      new SystemInterface({
        name: "TestSystem",
        events: [
          { name: "TestEvent", tags: ["sometag"] }
        ]
      })
    }).toThrow('payloadType')

    expect(() => {
      new SystemInterface({
        name: "TestSystem",
        events: [
          { 
            name: "TestEvent",
            payloadType: { someprop: "somevalue" },
            tags: ["sometag"]
          }
        ]
      })
    }).toThrow("sometag")
  })

  it("Corrrect call constructor", () => {
    const system = new SystemInterface({
      name: "TestSystem",
      events: [
        { 
          name: "testEvent",
          payloadType: { sometag: "somevalue" },
          tags: ["sometag"]
        },
        { 
          name: "testEventWithoutTags",
          payloadType: { someprop: "somevalue" },
        },
        { 
          name: "testEventTwo"
        }
      ]
    })

    expect(system.name).toBe("TestSystem")
    expect(system.events).toEqual({
      testEvent: { 
        name: "testEvent",
        payloadType: {
          sometag: "somevalue",
          system: "TestSystem" 
        },
        tags: ["sometag", "system"]
      },
      testEventWithoutTags: { 
        name: "testEventWithoutTags",
        payloadType: {
          someprop: "somevalue",
          system: "TestSystem"
        },
        tags: ["system"]
      },
      testEventTwo: { 
        name: "testEventTwo",
        payloadType: {
          system: "TestSystem"
        },
        tags: ["system"]
      }
    })
    expect(system.isContentingEvent(system.events.testEventTwo)).toBe(true)
  })

  it("Create event from template", () => {
    const system = new SystemInterface({
      name: "TestSystem",
      events: [
        { 
          name: "testEventTwo"
        }
      ]
    })

    const newEvent = system.createNewEvent({
      event: { name: "testEventTwo" }
    })

    expect(newEvent).toEqual({
      name: "testEventTwo",
      payload: {
        system: "TestSystem"
      },
      tags: ["system"]
    })

    expect(() => system.createNewEvent({
      event: { name: "testTipyEventTwo" }
    })).toThrow('contented')
  })
})