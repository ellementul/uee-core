import BaseMember from "../../BaseMember/abstaract-module.js"

class TestModuleTwo extends BaseMember {
  constructor (moduleName = "Module Two") {
    super()

    this.name = moduleName
  }
  defEvents () {
    return [{ name: 'ping' }, { name: 'answer' }]
  }

  run () {
    this.sendEvent({ 
      name: 'message', 
      payload: { 
        system: "Testing", 
        message: `It send ${this.name}`
      } 
    })
  }

  ping (payload) {
    expect(payload).toBe("It is sent Module One")
  }

  answer (payload) {
    expect(payload).toBe("It is sent Module One")
  }
}

export default TestModuleTwo