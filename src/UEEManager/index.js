const { UEEDispatcher } = require('../UEEDispatcher')
const { STATE_EVENT_NAME_CONSTATS, moduleManagerSystem } = require('../UEESystems/modules-system/modules-manager-system')

class UEEManager {
  constructor ({ dispatcher }) {

    if( !(dispatcher instanceof UEEDispatcher) )
      throw new Error("The dispatcher has to extend UEEDispatcher!")

    this.dispatcher = dispatcher
    dispatcher.onRecieveEvent( event => this.recieveEvent(event) )

    this.modules = new Map
    this.events = new Map
  }

  initRootModule (rootModule) {
    this.setDispatcherForModule(rootModule)
  }

  initModule (module) {
    this.setDispatcherForModule(module)

    const { name, payload, tags } = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.BUILD]
    })

    module.recieveEvent({
      name,
      payload: { entity: module.uuid, ...payload },
      tags: [ "entity", ...tags ]
    })

    return module
  }

  runModule ({ uuid }) {
    const { name, payload, tags } = moduleManagerSystem.createNewEvent({
      event: moduleManagerSystem.events[STATE_EVENT_NAME_CONSTATS.RUN]
    })

    this.recieveEvent({
      name,
      payload: { entity: uuid, ...payload },
      tags: [ "entity", ...tags ]
    })
  }

  setDispatcherForModule(module) {
    const uuid = module.uuid
    const dispatcher = this.generateDispatherForModule(uuid)
    
    module.setDispatcher(dispatcher)
    
    this.modules.set(uuid, {
      uuid,
      module,
    })
  }

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

  wrapSendEvent () {
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

module.exports = { UEEManager }