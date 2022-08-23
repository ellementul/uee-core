const { checkToBeValidEvent } = require("../../UEEDispatcher")

class SystemInterface {
  constructor({ name, events, modules }) {
    if(!name)
      throw new Error('System name is undefined!')
    this._name = name


    if(!Array.isArray(events) || events.length == 0)
      throw new Error('Events is undefined!')

    events.forEach(event => checkToBeValidEvent(event))
    this._events = events.map(event => this.defineSystemTag(event))

    this._modules = modules
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

  get moduleNames() {
    return this._modules.map( module => module.name )
  }

  get moduleTypes() {
    return this._modules.map( module => module.type )
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