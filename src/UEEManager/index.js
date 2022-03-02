import { v4 as uuidv4 } from 'uuid'

class UEEManager {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
    dispatcher.onRecieveEvent( event => this.recieveEvent(event) )

    this.modules = new Map
    this.events = new Map
  }

  async initModule (ModuleClass) {
    const uuid = uuidv4()
    const type = ModuleClass.name
    const dispatcher = this.generateDispatherForModule(uuid)

    const module = new ModuleClass()
    module.setDispatcher(dispatcher)

    this.modules.set(uuid, {
      type,
      uuid,
      module,
    })

    return module
  }

  async initModules (Modules, isRun = false) {
    const promises =  Modules.map(Module => {
      return this.initModule(Module)
    });
    const modules = await Promise.all(promises)

    if(isRun)
      this.run(modules)
  }

  run (modules) {
    modules = modules || this.modules
    Array.from(this.modules.values()).forEach( ({ module }) => module.run())
  }

  // async checkExistModule(module) {
  //   // TODO Check it on server
  //   return this.modules.has(nameModule)
  // }

  generateDispatherForModule (moduleUuid) {

    // Bind methods dispatcher to current module
    const defineListenerEvent = this.wrapDefineListenerEvent(moduleUuid)
    const sendEvent = this.wrapSendEvent(moduleUuid)
    const onRecieveEvent = this.wrapOnRecieveEvent(moduleUuid)

    return {
      defineListenerEvent,
      sendEvent,
      onRecieveEvent,
    }
  }

  wrapDefineListenerEvent (moduleUuid) {
    return event => {
      this.bindEventAndModule(moduleUuid, event)
      this.dispatcher.defineListenerEvent(event)
    }
  }

  wrapSendEvent (moduleUuid) {
    return event => {
      this.dispatcher.sendEvent(event)
    }
  }

  wrapOnRecieveEvent (moduleUuid) {
    return callback => {
      this.onRecieveEvent(moduleUuid, callback)
    }
  }

  onRecieveEvent (moduleUuid, recieveEvent) {

    if(typeof recieveEvent === "function") {
      const moduleEvents = this.getModuleByName(moduleUuid)
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

  bindEventAndModule (moduleUuid, event) {
    const { events } = this.getModuleByName(moduleUuid)
    const eventSignature = this.dispatcher.calculateEventSignature(event)

    if(!events.has(eventSignature))
      events.add(eventSignature)
  }

  getModuleByName (moduleUuid) {
    if(!this.events.has(moduleUuid))
        this.events.set(moduleUuid, { events: new Set, eventsCallback: () => { throw new Error('Not defined callback') } })

    return this.events.get(moduleUuid)
  }
}

export default UEEManager