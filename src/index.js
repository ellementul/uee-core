import Dispatcher from "./UEEDispatcher";
import YourModule from "./tests";
const dispatcher = new Dispatcher()
new YourModule(dispatcher)
// Need fabric: UEE.connect(YourModule)