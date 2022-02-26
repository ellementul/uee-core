import UEEModule from "../UEEModule/index.js"

class TestModule extends UEEModule {
  
  defineListenerEvents () {
    return [{ name: 'message' }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    console.log('Message Event: ', payload)
  }
}

export default TestModule