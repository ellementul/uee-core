import Dispatcher from "./UEEDispatcher/index.js";
import { UEEStateModule } from "./UEEModule/state-module.js"
import Manager from "./UEEManager/index.js"
import AbstractTransport from "./UEETransport/abstract-class.js";
import TestTransport from "./UEETransport/test-class.js";
import SocketIOServer from "./UEETransport/server-socket.io-class.js";
import SocketIOTransport from "./UEETransport/socket.io-class.js";

function UEEFabric ({ transport, modules = [] } = {}) {
  const dispatcher = new Dispatcher()

  if (transport) {
    if(transport instanceof AbstractTransport)
      dispatcher.connectServer(transport)
    else
      throw new Error("The transport doesn't extend AbstractTransport")
  }

  const manager = new Manager(dispatcher)

  if(!Array.isArray(modules) || modules.some(module => !(module instanceof UEEStateModule) ))
    throw new Error("Not valid modules!")  

  if(modules.length)
    this.initModules(modules)
}

export { AbstractTransport, TestTransport, SocketIOServer, SocketIOTransport,  UEEStateModule as Module, UEEFabric as UEE }