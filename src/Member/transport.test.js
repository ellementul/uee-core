import test from 'ava'
import sinon from "sinon"

import { MemberFactory } from './index.js'
import { EventFactory, Types } from '../Event/index.js'
import { InMemory } from '../Transports/InMemory/index.js'
import { connectionEvent } from '../Provider/events.js'

function later(delay) {
  return new Promise(function(resolve) {
      setTimeout(resolve, delay)
  })
}

test('Transport', async t => {
  const id = "testTransForMember"

  const firstRoom = new MemberFactory
  firstRoom.makeRoom({ transport: new InMemory({ id, isHost: true }) })
  firstRoom.connect()

  const secondRoom = new MemberFactory
  secondRoom.makeRoom({ transport: new InMemory({ id, isHost: false }) })
  secondRoom.connect()

  const event = EventFactory(Types.Object.Def({ system: "test" }))
  const callback = sinon.fake()

  const secondEvent = EventFactory(Types.Object.Def({ system: "test2" }))
  const secondCallback = sinon.fake()

  firstRoom.subscribe(event, callback)
  secondRoom.subscribe(secondEvent, secondCallback)

  secondRoom.subscribe(connectionEvent, () => {
    secondRoom.send(event)
  })

  firstRoom.subscribe(connectionEvent, () => {
    firstRoom.send(secondEvent)
  })

  await later(100)

  t.true(callback.calledOnceWith({ system: "test" }))
  t.true(secondCallback.calledOnceWith({ system: "test2" }))
})