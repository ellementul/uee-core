import { checkAccessLvl, decreaseAccessLvl, Types } from "../Event/index.js"
import { Provider } from "../Provider/index.js"

export function MemberFactory (validationMsg = false) {

    const uuid = Types.UUID.Def().rand()
    const subscribedEvents = new Map

    return {
        get uuid() {
            return uuid
        },

        send(typeMsg, payload) {
            const msg = typeMsg.createMsg(payload, validationMsg)
            
            this.sendEvent(msg)
        },

        sendEvent(msg, payload) {
            if(this.isRoom && this.outsideRoom) {
                if(checkAccessLvl(msg))
                    this.outsideRoom.sendEvent(decreaseAccessLvl(msg))

                this.provider.sendEvent(msg)
            }
            else if(this.outsideRoom) {
                this.outsideRoom.sendEvent(msg)
            }
            else if(this.isRoom) {
                this.provider.sendEvent(msg)
            }
            else {
                throw new Error("It cannot send msg, it isn't Room and it doesn't connect to Room")
            }   

            if(typeof this.receiveAll === "function")
                this.receiveAll(msg)
        },

        subscribe(msgType, callback, memberUuid, limit) {
            limit = limit || -1
            memberUuid = memberUuid || uuid

            if(this.isRoom && this.outsideRoom) {
                if(checkAccessLvl(msgType))
                    this.outsideRoom.subscribeEventInside(msgType.decreaseAccessLvl(), callback, memberUuid, limit)

                this.provider.onEvent(msgType, callback, memberUuid, limit)
            }
            else if(this.outsideRoom) {
                this.outsideRoom.subscribeEventInside(msgType, callback, memberUuid, limit)
            }
            else if(this.isRoom) {
                this.provider.onEvent(msgType, callback, memberUuid, limit)
            }
            else {
                throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
            } 
        },

        unsubscribe(msgType, memberUuid) {
            memberUuid = memberUuid || uuid

            this.provider.offEvent(msgType, memberUuid)
        },

        subscribeEventInside(msgType, callback, memberUuid, limit) {
            if(!this.members.has(memberUuid))
                throw new Error(`This uuid not found: ${memberUuid}`)

            this.subscribe(msgType, callback, memberUuid, limit)
            subscribedEvents.set(memberUuid, msgType)
        },

        makeRoom(){
            if(this.isRoom)
                return

            this.isRoom = true
            this.provider = new Provider
            this.members = new Map
        },

        destroy(){
            if(this.isRoom)
                this.clearRoom()

            for (const [uuid, typeMsg] of subscribedEvents) {
                this.outsideRoom.unsubscribe(typeMsg, uuid)
            }
        },

        clearRoom(){
            for (const [uuid, _] of this.members) {
                this.deleteMember(uuid)
            }
        },

        setOutsideRoom(room) {
            this.outsideRoom = room

            if(typeof this.onConnectRoom == "function")
                this.onConnectRoom()
        },

        addMember(newMember) {
            if(!this.isRoom)
                throw new TypeError(`This member is not Room! Call method "makeRoom" please!`)

            this.members.set(newMember.uuid, newMember)
            newMember.setOutsideRoom(this)
        },

        deleteMember(uuid) {
            const member = this.members.delete(uuid)

            if(member) {
                member.destroy()
            }          
        }
    }
}