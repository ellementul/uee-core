import Dispatcher from "./UEEDispatcher/index.js";
import Module from "./UEEModule/index.js"
import Manager from "./UEEManager/index.js"
import AbstractTransport from "./UEETransport/abstract-class.js";

class UEEFabric {
  constructor ({ transport } = {}) {
    const dispatcher = new Dispatcher()

    if (transport) {
      if(transport instanceof AbstractTransport)
        dispatcher.connectServer(transport)
      else
        throw new Error("The transport doesn't extend AbstractTransport")
    }

    const manager = new Manager(dispatcher)
    this.initModule = module => manager.initModule(module)
    this.run = () => manager.run()
  }

  async initModules (modules) {
    const promises =  modules.map(module => {
      return this.initModule(module)
    });
    await Promise.all(promises)
  } 
}

export { AbstractTransport,  Module, UEEFabric as UEE }