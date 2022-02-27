import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"

import { UEE } from "../index.js"

console.log('-----------------TEST--------------------')

const envariament = new UEE
await envariament.initModules([TestModuleOne, TestModuleTwo])
envariament.run()
