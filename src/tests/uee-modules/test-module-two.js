import UEEModule from "../../UEEModule/index.js"

class TestModuleTwo extends UEEModule {
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