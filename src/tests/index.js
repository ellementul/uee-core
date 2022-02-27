import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"
import staticServer from "./staticServer.js"
import UEEServer from "./socketServer.js"

import { SocketIo } from "../UEETransport/index.js"
import Dispatcher from "../UEEDispatcher/index.js";
import Manager from "../UEEManager/index.js";

console.log('-----------------TEST--------------------')

const dispatcher = new Dispatcher()
dispatcher.connectServer(new SocketIo("http://localhost:8080"))
const manager = new Manager(dispatcher)

//TODO Make to init module or init modules(path to dir of modules)
await manager.initModule(TestModuleOne)
await manager.initModule(TestModuleTwo)
manager.run()

new UEEServer(staticServer)
staticServer.listen(8080)
