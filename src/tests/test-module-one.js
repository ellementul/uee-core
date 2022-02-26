import UEEModule from "../UEEModule/index.js"

class TestModule extends UEEModule {
  defineListenerEvents () {
    return [{ name: 'ping' }]
  }

  run () {
    this.sendEvent({ name: 'ping', payload: 'It is sent Module One' })
  }

  message (payload) {
    console.log('-----------------TEST--------------------')
    console.log('Paylod of message: ')
    console.log(payload)
  }
}

export default TestModule