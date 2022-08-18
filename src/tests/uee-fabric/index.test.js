import TestModuleOne from "./test-module-one.js"
import TestModuleTwo from "./test-module-two.js"
import TestModuleOneWithParams from "./test-module-one-with-params.js"
import { TestTransport, UEE } from "../../index.js"



describe('Test create Modules', () => {

  it('Test create Module', () => {
    const transport = new TestTransport()

    expect.assertions(3)

    new UEE({
      modules: [new TestModuleOne, new TestModuleTwo],
      transport,
      isRun: true 
    })
  })

  it('Test create Module with params', () => {
    const moduleName = 'Module with params'
    const transport = new TestTransport()

    expect.assertions(3)

    new UEE({
      modules: [new TestModuleOneWithParams(moduleName), new TestModuleTwo(moduleName)],
      transport,
      isRun: true 
    })
  })
})


