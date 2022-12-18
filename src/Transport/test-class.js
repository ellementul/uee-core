const { AbstractTransport } = require("./index")

class TestTransport extends AbstractTransport {

  constructor (done, expectingEvents, log) {
    super()

    this.finish = () => { done() }
    this.eventCallbacks = []

    if(expectingEvents.length < 1)
      throw "Minimum is one expecting event!"

    this.expectingEvents = new Set(expectingEvents.map( event => JSON.stringify(event) ))
    
    this.log = log ? msg => log(`Test Transport: \n   ${msg} \n`) : () => {}
  }

  send (event) {
    this.checkEvent(event)
    process.nextTick(
      () => this.eventCallbacks.forEach(eventCallback => eventCallback(event))
    )
  }

  onRecieve (eventCallback) {
    this.log('Connected event callback...')
    this.eventCallbacks.push(event => eventCallback(event))
  }

  checkEvent (event) {
    if(this.expectingEvents.has(JSON.stringify(event.data)))
      this.expectingEvents.delete(JSON.stringify(event.data))
    else
      throw `Invalid event: ${JSON.stringify(event.data)}`

    if(this.expectingEvents.size == 0)
      this.finish()
  }
}

module.exports = { TestTransport }