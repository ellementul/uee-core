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
          name: "TestEvent",
          payloadType: { sometag: "somevalue" },
          tags: ["sometag"]
        },
        { 
          name: "TestEventWithoutTags",
          payloadType: { someprop: "somevalue" },
        },
        { 
          name: "TestEventTwo"
        }
      ]
    })

    expect(system.name).toBe("TestSystem")
    expect(system.events).toEqual({
      TestEvent: { 
        name: "TestEvent",
        payloadType: {
          sometag: "somevalue",
          system: "TestSystem" 
        },
        tags: ["sometag", "system"]
      },
      TestEventWithoutTags: { 
        name: "TestEventWithoutTags",
        payloadType: {
          someprop: "somevalue",
          system: "TestSystem"
        },
        tags: ["system"]
      },
      TestEventTwo: { 
        name: "TestEventTwo",
        payloadType: {
          system: "TestSystem"
        },
        tags: ["system"]
      }
    })
  })
})