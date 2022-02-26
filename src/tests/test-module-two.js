import UEEModule from "../UEEModule/index.js"

class TestModuleTwo extends UEEModule {
  defineListenerEvents () {
    return [{ name: 'ping' }]
  }

  run () {
    this.sendEvent({ name: 'message', payload: 'It send Module Two' })
  }

  ping (payload) {
    console.log('Ping Event: ', payload)
  }
}

export default TestModuleTwo