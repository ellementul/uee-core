import UEEModule from "../../UEEModule/index.js"

class TestModuleOneWithParams extends UEEModule {

  constructor (moduleName) {
    super()

    this.name = moduleName
  }
  
  defEvents () {
    return [{ name: 'message', payloadType: { system: "Testing" } }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    expect(payload).toEqual({ system: 'Testing', message: `It send ${this.name}` });
    this.sendEvent({ name: 'answer', payload: 'It is sent Module One' })
  }
}

export default TestModuleOneWithParams