import UEEModule from "../UEEModule/index.js"

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

export default YourModule