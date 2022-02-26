import UEEModule from "../UEEModule/index.js"
import Dispatcher from "../UEEDispatcher/index.js";
import Manager from "../UEEManager/index.js";

class TestModule extends UEEModule {
  defineListenerEvents () {
    return [{ name: 'message' }]
  }

  run () {
    this.sendEvent({ name: 'message', payload: 'Somethig...' })
  }

  message (payload) {
    console.log('-----------------TEST--------------------')
    console.log('Paylod of message: ')
    console.log(payload)
  }
}


const dispatcher = new Dispatcher()
const manager = new Manager(dispatcher)
manager.run(TestModule)