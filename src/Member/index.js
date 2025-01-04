import { Types } from "../Event/index.js"
import { Provider } from "../Provider/index.js"
import { errorEvent } from "./events.js"

export class MemberFactory {

    constructor() {
        this._uuid = Types.UUID.Def().rand()

        this.subscribedEvents = new Map
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

        if(!this.isRoom && !this.outsideRoom)
            throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
    }

    unsubscribe(msgType, memberUuid) {
        memberUuid = memberUuid || this.uuid

        this.provider.offEvent(msgType, memberUuid)
    }

    makeRoom({ debug = false } = {}){
        this.debug = debug

        if(this.isRoom)
            return

        this.isRoom = true
        this.provider = new Provider
        this.members = new Map

        if(typeof this.onMakeRoom == "function")
            this.onMakeRoom()
    }

    destroy(){
        if(this.isRoom)
            this.clearRoom()

        for (const [uuid, typeMsg] of this.subscribedEvents) {
            this.outsideRoom.unsubscribe(typeMsg, uuid)
        }
    }

    clearRoom(){
        for (const [uuid, _] of this.members) {
            this.deleteMember(uuid)
        }
    }

    setOutsideRoom(room) {
        this.outsideRoom = room

        if(typeof this.onConnectRoom == "function")
            this.onConnectRoom()
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