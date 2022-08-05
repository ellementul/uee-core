import Dispatcher from "./UEEDispatcher/index.js";
import Module from "./UEEModule/index.js"
import Manager from "./UEEManager/index.js"
import AbstractTransport from "./UEETransport/abstract-class.js";
import TestTransport from "./UEETransport/test-class.js";
import SocketIOServer from "./UEETransport/server-socket.io-class.js";
import SocketIOTransport from "./UEETransport/socket.io-class.js";

class UEEFabric {
  constructor ({ transport, modules = [], isRun = false } = {}) {
    const dispatcher = new Dispatcher()

    if (transport) {
      if(transport instanceof AbstractTransport)
        dispatcher.connectServer(transport)
      else
        throw new Error("The transport doesn't extend AbstractTransport")
    }

    const manager = new Manager(dispatcher)
    this.initModules = (modules, isRun) => manager.initModules(modules, isRun)

    if(!Array.isArray(modules))
      throw new Error("Not valid modules!")  

    if(modules.length)
      this.initModules(modules, isRun)
  } 
}

export { AbstractTransport, TestTransport, SocketIOServer, SocketIOTransport,  Module, UEEFabric as UEE }