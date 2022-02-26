class UEEManager {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
    this.modules = new Map
  }

  async initModule (ModuleClass) {
    const existModule = await this.checkExistModule(ModuleClass)

    if(existModule) {
      console.warn(`Reapeted running this module: ${ModuleClass.name}`)
      return
    }

    const module = new ModuleClass(this.dispatcher)
    this.modules.set(module.name, module)
  }

  run () {
    Array.from(this.modules.values()).forEach(module => module.run())
  }

  async checkExistModule(ModuleClass) {
    // TODO Check it on server
    return this.modules.has(ModuleClass.name)
  }
}

export default UEEManager