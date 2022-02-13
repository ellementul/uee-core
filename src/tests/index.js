import UEEModule from "../UEEModule"

class YourModule extends UEEModule {
  defineEvents () {
    return ['message']
  }

  run () {
    this.sendEvent()
  }

  message (payload) {
    console.log('-----------------TEST--------------------')
    console.log('Paylod of message')
    console.log(payload)
  }
}

export default YourModule