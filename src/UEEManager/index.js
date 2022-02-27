class UEEManager {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
    dispatcher.onRecieveEvent( event => this.recieveEvent(event) )

    this.modules = new Map
    this.events = new Map

    this._isRan = false
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

    return module
  }

  async initModules (Modules) {
    const promises =  Modules.map(Module => {
      return this.initModule(Module)
    });
    const modules = await Promise.all(promises)

    if(this._isRan)
      this.run(modules)
  }

  run (modules) {
    modules = modules || this.modules
    Array.from(this.modules.values()).forEach( module => module.run())
    this._isRan = true
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
      this.bindEventAndModule(moduleName, event)
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
      this.onRecieveEvent(moduleName, callback)
    }
  }

  onRecieveEvent (moduleName, recieveEvent) {

    if(typeof recieveEvent === "function") {
      const moduleEvents = this.getModuleByName(moduleName)
      moduleEvents.eventsCallback = recieveEvent
    }
    else
      throw new Error("The recieve callback isn't function!")
  }

  recieveEvent (event) {
    const modules = this.getModuleByEvent(event)
    modules.forEach( ({ eventsCallback }) => eventsCallback(event) )
  }

  getModuleByEvent (event) {
    const eventSignature = this.dispatcher.calculateEventSignature(event)
    const modules = Array.from(this.events.values())
    return modules.filter(module => module.events.has(eventSignature))
  }

  bindEventAndModule (moduleName, event) {
    const { events } = this.getModuleByName(moduleName)
    const eventSignature = this.dispatcher.calculateEventSignature(event)

    if(!events.has(eventSignature))
      events.add(eventSignature)
  }

  getModuleByName (moduleName) {
    if(!this.events.has(moduleName))
        this.events.set(moduleName, { events: new Set, eventsCallback: () => { throw new Error('Not defined callback') } })

    return this.events.get(moduleName)
  }
}

export default UEEManager