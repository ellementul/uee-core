import UEEModule from "../../UEEModule/index.js"

class TestModuleTwo extends UEEModule {
  constructor (done, moduleName = "Module Two") {
    super()

    this.name = moduleName
    this.done = () => done()
  }
  defEvents () {
    return [{ name: 'ping' }, { name: 'answer' }]
  }

  run () {}

  ping (payload) {
    expect(payload).toBe("It is sent Module One")
    this.sendEvent({ 
      name: 'message', 
      payload: { 
        system: "Testing", 
        message: `It send ${this.name}`
      } 
    })
  }

  answer (payload) {
    expect(payload).toBe("It is sent Module One")
    this.done()
  }
}

export default TestModuleTwo