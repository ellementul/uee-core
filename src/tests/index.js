import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"
import staticServer from "./staticServer.js"
import socketServer from "./socketServer.js"

import Dispatcher from "../UEEDispatcher/index.js";
import Manager from "../UEEManager/index.js";

const dispatcher = new Dispatcher()
const manager = new Manager(dispatcher)

console.log('-----------------TEST--------------------')

//TODO Make to init module or init modules(path to dir of modules)
await manager.initModule(TestModuleOne)
await manager.initModule(TestModuleTwo)
manager.run()

socketServer.listen(3000)
staticServer.listen(8080)
