import Dispatcher from "./UEEDispatcher/index.js";
import YourModule from "./tests/index.js";
const dispatcher = new Dispatcher()
const yourModule = new YourModule(dispatcher)

yourModule.run()
// Need fabric: UEE.connect(YourModule)