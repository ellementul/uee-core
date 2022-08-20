import TestModuleOne from "../uee-fabric/test-module-one.js"
import TestModuleTwo from "./test-module-two.js"
import { SocketIOServer, SocketIOTransport, UEE } from "../../index.js"
import { jest } from '@jest/globals';

jest.setTimeout(10000)

describe('Test create Socket IO Transport', () => {
  let server

  beforeAll(() => {
    server = new SocketIOServer("*", 5000)
  })

  it('Test sync create two Envs', done => {
    expect.assertions(3)
    const transport = new SocketIOTransport('ws://localhost:5000')

    new UEE({
      modules: [new TestModuleOne],
      transport,
      isRun: true
    })

    new UEE({
      modules: [new TestModuleTwo(done)],
      transport,
      isRun: true 
    })
  })
})


