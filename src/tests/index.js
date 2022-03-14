import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-with-constructor.js"
import { AbstractTransport, UEE } from "../index.js"

class TestTransport extends AbstractTransport {

  constructor () {
    super()
    this.eventCallbacks = []
  }

  send (event) {
    console.log('Serever got event with name: ', event.name, ' with server time: ', event.time)
    this.eventCallbacks.forEach(eventCallback => eventCallback(event))
  }

  onRecieve (eventCallback) {
    console.log('Connected event callback...')
    this.eventCallbacks.push(event => eventCallback(event))
  }
}

console.log('-----------------TEST--------------------')

const transport = new TestTransport

new UEE({
  modules: [new TestModuleOne, new TestModuleTwo],
  transport,
  isRun: true 
})

new UEE({
  modules: [new TestModuleOne, new TestModuleTwo("Module with constractor")],
  transport,
  isRun: true 
})


