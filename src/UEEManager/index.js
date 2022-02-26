class UEEManager {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
  }

  run (ModuleClass) {
    const module = new ModuleClass(this.dispatcher)
    module.run()
  }
}

export default UEEManager