import UEEModule from "../UEEModule/index.js"

class TestModuleOne extends UEEModule {
  
  defEvents () {
    return [{ name: 'message', payloadType: { system: "Testing" } }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    console.log('ModuleOne get Message Event: ', payload)
    this.sendEvent({ name: 'answer', payload: 'It is sent Module One' })
  }
}

export default TestModuleOne