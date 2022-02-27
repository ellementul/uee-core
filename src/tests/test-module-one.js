import UEEModule from "../UEEModule/index.js"

class TestModuleOne extends UEEModule {
  
  defEvents () {
    return [{ name: 'message' }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    console.log('Message Event: ', payload)
    this.sendEvent({ name: 'answer', payload: 'It is sent Module One' })
  }
}

export default TestModuleOne