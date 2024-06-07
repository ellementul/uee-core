import { checkAccessLvl, decreaseAccessLvl, Types } from "../Event/index.js"
import { Provider } from "../Provider/index.js"

export function memberFactory (validationMsg = false) {

    const uuid = Types.UUID.Def().rand()
    const subscribedEvents = new Map

    return {
        get uuid() {
            return uuid
        },

        send(typeMsg, payload) {
            const signEvent = typeMsg.sign()

            if(outsideListeningEvents.has(signEvent))
                console.warn("You send event what this member listens, it may be cycle in calls of one event!")

            const msg = typeMsg.createMsg(payload, validationMsg)
            
            if(checkAccessLvl(msg) && typeof this.outsideRoom)
                this.outsideRoom.send(decreaseAccessLvl(msg))

            if(this.isRoom)
                this.provider.sendEvent(msg)

            if(typeof receiveAll === "function")
                this.receiveAll(msg)
        },

        subscribe(msgType, callback, memberUuid, limit) {
            limit = limit || -1
            memberUuid = memberUuid || uuid

            if(typeof this.outsideRoom && checkAccessLvl(msgType))
                this.subscribeEventOutside(msgType, callback, memberUuid, limit)

            if(this.isRoom)
                this.provider.onEvent(msgType, callback, memberUuid, limit)
        },

        unsubscribe(msgType, memberUuid) {
            memberUuid = memberUuid || uuid

            this.provider.offEvent(msgType, memberUuid)
        },

        subscribeEventOutside(msgType, callback, memberUuid, limit) {
            if(!this.members.has(memberUuid))
                throw new Error(`This uuid not found: ${memberUuid}`)

            subscribedEvents.set(memberUuid, msgType)
            this.outsideRoom.subscribe(msgType, callback, memberUuid, limit)
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
        },

        addMember(Factory) {
            if(!this.isRoom)
                throw new TypeError(`This member is not Room! Call method "makeRoom" please!`)

            const newMember = Factory()
            newMember.setOutsideRoom(this)
            this.members.set(newMember.uuid, newMember)
            
            if(typeof newMember.init === "function")
                newMember.init()
        },

        deleteMember(uuid) {
            const member = this.members.delete(uuid)

            if(member) {
                member.destroy()
            }          
        }
    }
}