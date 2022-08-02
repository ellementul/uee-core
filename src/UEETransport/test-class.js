import AbstractTransport from "./abstract-class.js"

class TestTransport extends AbstractTransport {

  constructor (log) {
    super()
    this.eventCallbacks = []
    this.log = log ? msg => log(`Test Transport: \n   ${msg} \n`) : () => {}
  }

  send (event) {
    this.log(`Serever got event with name: ${event.name} with server time: ${event.time}`)
    this.eventCallbacks.forEach(eventCallback => eventCallback(event))
  }

  onRecieve (eventCallback) {
    this.log('Connected event callback...')
    this.eventCallbacks.push(event => eventCallback(event))
  }
}

export default TestTransport