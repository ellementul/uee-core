import UEEModule from "../UEEModule/index.js"

class TestModuleTwo extends UEEModule {
  defEvents () {
    return [{ name: 'ping' }, { name: 'answer' }]
  }

  run () {
    this.sendEvent({ name: 'message', payload: 'It send Module Two' })
  }

  ping (payload) {
    console.log('ModuleTwo get Ping Event: ', payload)
  }

  answer (payload) {
    console.log('ModuleTwo get Answer Event: ', payload)
  }
}

export default TestModuleTwo