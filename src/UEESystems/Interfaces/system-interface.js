const { checkToBeValidEvent } = require("../../UEEDispatcher")

class SystemInterface {
  constructor({ name, events, modules = [] }) {
    if(!name)
      throw new Error('System name is undefined!')
    this._name = name


    if(!Array.isArray(events) || events.length == 0)
      throw new Error('Events is undefined!')

    events.forEach(event => checkToBeValidEvent(event))
    this._events = events.map(event => this.defineSystemTag(event))

    this._modules = modules
    .filter( module => {
      if(!module.name)
        throw new Error(`There is incorrect module: ${JSON.stringify(module)} with undefined name`)

      if(!module.type)
        throw new Error(`There is incorrect module: ${JSON.stringify(module)} with undefined type`)
      
      return true
    })
  }

  get name() {
    return this._name
  }

  get events() {
    const events = {}
    this._events.forEach(event => events[event.name] = JSON.parse(JSON.stringify(event)) )
    return events
  }

  createNewEvent({ event: { name }, payload }) {
    if(!this.events[name])
      throw new Error(`This event ${name} isn't contented any defined system!`)

    const { payloadType, tags } = this.events[name]
    const newEvent = { name, payload: { ...payload, ...payloadType }, tags }

    return newEvent
  }

  get modules () {
    const modules = {}
    this._modules.forEach(module => modules[module.name] = JSON.parse(JSON.stringify(module)) )
    return modules
  }

  get modulesByTypes () {
    const modules = {}
    this._modules.forEach(module => modules[module.type] = JSON.parse(JSON.stringify(module)) )
    return modules
  }

  defineSystemTag({ name, payloadType = {}, tags = []}) {
    tags.push("system")
    payloadType.system = this._name

    return { name, payloadType, tags}
  }

  isContentingEvent(event) {
    return this._events.map( eventOfSystem => JSON.stringify(eventOfSystem) ).includes(JSON.stringify(event))
  }
}

module.exports = { SystemInterface }