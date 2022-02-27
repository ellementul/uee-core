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
    this.initModules = module => manager.initModules(module)
    this.run = () => manager.run()
  } 
}

export { AbstractTransport,  Module, UEEFabric as UEE }