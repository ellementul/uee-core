import TestModuleOne from "../uee-fabric/test-module-one.js"
import TestModuleTwo from "../uee-fabric/test-module-two.js"
import { TestTransport, UEE } from "../../index.js"
import { jest } from '@jest/globals';

jest.useFakeTimers()

describe('Test create Transport', () => {

  it('Test sync create two Envs', () => {
    const transport = new TestTransport()

    expect.assertions(3)

    new UEE({
      modules: [new TestModuleOne],
      transport,
      isRun: true 
    })

    new UEE({
      modules: [new TestModuleTwo],
      transport,
      isRun: true 
    })
  })

  it('Test async create two Envs(run last module that begin procces)', async () => {
    const transport = new TestTransport()
    expect.assertions(3)

    setTimeout(() => {
      new UEE({
        modules: [new TestModuleOne],
        transport,
        isRun: true 
      })
    }, 500)

    new UEE({
      modules: [new TestModuleTwo],
      transport,
      isRun: true 
    })

    jest.runAllTimers()
  })
})


