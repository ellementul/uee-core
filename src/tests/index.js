import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"
import Dispatcher from "../UEEDispatcher/index.js";
import Manager from "../UEEManager/index.js";

const dispatcher = new Dispatcher()
const manager = new Manager(dispatcher)

console.log('-----------------TEST--------------------')

manager.run(TestModuleOne)
manager.run(TestModuleTwo)

//TODO Make to run module or modules