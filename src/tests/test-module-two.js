import UEEModule from "../UEEModule/index.js"

class TestModule extends UEEModule {
  defineListenerEvents () {
    return [{ name: 'message' }]
  }

  run () {
    this.sendEvent({ name: 'message', payload: 'It send Module Two' })
  }

  message (payload) {
    console.log('-----------------TEST--------------------')
    console.log('Paylod of message: ')
    console.log(payload)
  }
}

export default TestModule