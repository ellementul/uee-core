import { EventFactory, Types } from "../Event/index.js"
import { Provider } from "../Provider/index.js"
import { errorEvent } from "./events.js"

export class MemberFactory {

    constructor() {
        this._uuid = Types.UUID.Def().rand()

        this.subscribedOutEvents = new Map
    }

    get uuid() {
        return this._uuid
    }

    send(typeMsg, payload) {
        const msg = typeMsg.createMsg(payload, this.debug)
        
        this.sendEvent(msg)
    }

    sendEvent(msg) {        
        if(this.isRoom)
            this.provider.sendEvent(msg)

        if(!this.isRoom && this.outsideRoom)
            this.outsideRoom.sendEvent(msg)

        if(this.isRoom && this.outsideRoom && this.outEvent.isValid(msg))
            this.outsideRoom.sendEvent(msg)

        if(!this.isRoom && !this.outsideRoom)
            throw new Error("It cannot send msg, it isn't Room and it doesn't connect to Room") 

        if(typeof this.receiveAll === "function")
            this.receiveAll(msg)
    }

    subscribe(msgType, callback, memberUuid, limit) {
        limit = limit || -1
        memberUuid = memberUuid || this.uuid

        if(this.debug) {
            const rawCallback = callback
            callback = msg => {
                try {
                    rawCallback(msg)
                } catch (error) {
                    const erMsg = {
                        member: this.constructor.name,
                        gotMsg: msg,
                        rawError: error
                    }

                    console.error(erMsg)
                    this.send(errorEvent, erMsg)
                }
            }
        }

        if(this.isRoom)
            this.provider.onEvent(msgType, callback, memberUuid, limit)

        if(!this.isRoom && this.outsideRoom)
            this.outsideRoom.subscribe(msgType, callback, memberUuid, limit)

        if(this.isRoom && this.outsideRoom)
            this.subscribeOut(msgType, callback, memberUuid, limit)
        
        if(!this.isRoom && !this.outsideRoom)
            throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
    }

    subscribeOut(msgType, callback, memberUuid, limit) {
        if(this.inEvents && !this.inEvents.has(msgType.sign()))
            return

        const uid = this._uuid + "/" + memberUuid
        this.outsideRoom.subscribe(msgType, callback, uid + memberUuid, limit)
        this.subscribedOutEvents.set(memberUuid, msgType)
    }

    unsubscribe(msgType, memberUuid) {
        memberUuid = memberUuid || this.uuid

        if(this.isRoom)
            this.provider.offEvent(msgType, memberUuid)

        if(!this.isRoom && this.outsideRoom)
            this.outsideRoom.unsubscribe(msgType, memberUuid)

        if(this.isRoom && this.outsideRoom)
            this.unsubscribeOut(msgType, memberUuid)

        if(!this.isRoom && !this.outsideRoom)
            throw new Error("It cannot unsubscribe, it isn't Room and it doesn't connect to Room")
    }

    unsubscribeOut(msgType, memberUuid) {
        if(this.inEvents && !this.inEvents.has(msgType.sign()))
            return

        const uid = this._uuid + "/" + memberUuid
        this.outsideRoom.unsubscribe(msgType, uid)
        this.subscribedOutEvents.delete(memberUuid)
    }

    makeRoom({ debug = false, outEvents = [], inEvents = [] } = {}){
        this.debug = debug

        if(this.isRoom)
            return

        this.isRoom = true
        this.provider = new Provider
        this.members = new Map

        if(outEvents.length > 0)
            this.outEvent = EventFactory(Types.Any.Def(outEvents.map( event => event.type)))
        else
            this.outEvent = EventFactory(Types.Any.Def())

        if(inEvents.length > 0)
            this.inEvents = new Set(inEvents.map(event => event.sign()))

        if(typeof this.onMakeRoom == "function")
            this.onMakeRoom()

        if(typeof this.onReady == "function")
            this.onReady()
    }

    setOutsideRoom(room) {
        this.outsideRoom = room

        if(typeof this.onJoinRoom == "function")
            this.onJoinRoom()

        if(typeof this.onReady == "function")
            this.onReady()
    }

    destroy(){
        if(this.isRoom)
            this.clearRoom()

        for (const [uuid, typeMsg] of this.subscribedOutEvents) {
            this.outsideRoom.unsubscribe(typeMsg, uuid)
        }
    }

    clearRoom(){
        for (const [uuid, _] of this.members) {
            this.deleteMember(uuid)
        }

        this.outEvent = null
        this.inEvents = null
    }

    addMember(newMember) {
        if(!this.isRoom)
            throw new TypeError(`This member is not Room! Call method "makeRoom" please!`)

        this.members.set(newMember.uuid, newMember)
        newMember.setOutsideRoom(this)
    }

    deleteMember(uuid) {
        const member = this.members.delete(uuid)

        if(member) {
            member.destroy()
        }          
    }
}