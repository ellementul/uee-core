import test from 'ava'
import sinon from 'sinon'
import { EventFactory, Types } from '../../Event/index.js'
import { MemberFactory } from '../../Member/index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('Not get self event', async t => {
    const room = new MemberFactory
    room.makeRoom()

    const secondRoom = new MemberFactory
    secondRoom.makeRoom()
    room.addMember(secondRoom)

    const member = new MemberFactory
    secondRoom.addMember(member)

    const errorEvent = EventFactory(Types.Object.Def({ system: "test" }))
    const getError = () => member.subscribe(errorEvent, () => {}, false)

	t.throws(getError, { instanceOf: TypeError })

    const event = EventFactory(Types.Object.Def({ system: "test", sourceUid: Types.Key.Def(3) }))
    const callback = sinon.fake()
    room.subscribe(event, callback)
    member.subscribe(event, callback, false)

    member.send(event, { sourceUid: member.uid() })

    await later(0)

    t.true(callback.calledOnce)
})