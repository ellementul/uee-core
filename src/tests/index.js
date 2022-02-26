import UEEModule from "../UEEModule/index.js"
import Dispatcher from "../UEEDispatcher/index.js";

class YourModule extends UEEModule {
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
const yourModule = new YourModule(dispatcher)
yourModule.run()