import sinon from "sinon"

import { MemberFactory } from '../../index.js'
import { EventFactory, Types } from '../../../Event/index.js'

function later(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
}

export async function runTests() {

    const member = new MemberFactory
    member.makeRoom()

    console.log("Is room: ", member.isRoom)
    
    const event = EventFactory(Types.Object.Def({ system: "test" }))
    const callback = sinon.fake()
    
    member.subscribe(event, callback)
    member.send(event)
    
    await later(100)

    console.log("Is got event: ", callback.calledOnceWith({ system: "test" }))
}

