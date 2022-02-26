class UEEManager {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
    this.modules = new Map
  }

  async initModule (ModuleClass) {
    const nameModule = ModuleClass.name
    const existModule = await this.checkExistModule(nameModule)

    if(existModule) {
      console.warn(`Reapeted running this module: ${nameModule}`)
      return
    }

    const dispatcherForThisModule = this.generateDispatherForModule(nameModule)
    const module = new ModuleClass(dispatcherForThisModule)
    this.modules.set(nameModule, module)
  }

  run () {
    Array.from(this.modules.values()).forEach(module => module.run())
  }

  async checkExistModule(nameModule) {
    // TODO Check it on server
    return this.modules.has(nameModule)
  }

  generateDispatherForModule (moduleName) {

    // Bind methods dispatcher to current module
    const defineListenerEvent = this.wrapDefineListenerEvent(moduleName)
    const sendEvent = this.wrapSendEvent(moduleName)
    const onRecieveEvent = this.wrapOnRecieveEvent(moduleName)

    return {
      defineListenerEvent,
      sendEvent,
      onRecieveEvent,
    }
  }

  wrapDefineListenerEvent (moduleName) {
    return event => {
      this.dispatcher.defineListenerEvent(event)
    }
  }

  wrapSendEvent (moduleName) {
    return event => {
      this.dispatcher.sendEvent(event)
    }
  }

  wrapOnRecieveEvent (moduleName) {
    return callback => {
      this.dispatcher.onRecieveEvent(callback)
    }
  }
}

export default UEEManager