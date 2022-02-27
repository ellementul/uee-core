import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"

import { UEE } from "../index.js"

console.log('-----------------TEST--------------------')

const envariament = new UEE
envariament.run()
await envariament.initModules([TestModuleOne, TestModuleTwo])


