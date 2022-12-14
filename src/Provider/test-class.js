const { Provider } =  require("./index")
const { TestTransport } = require("../UEETransport/test-class.js")

class TestProvider extends Provider {
  constructor (done, expectedEvents = []) {
    super()

    if(expectedEvents.length > 0)
      this.setTransport(new TestTransport(done, expectedEvents))
  }

  connectMemeber(MemeberClass, constructorParams) {
    const member = new MemeberClass(constructorParams)
    member.setDispatcher(this)

    return member
  } 
}

module.exports = { TestProvider }