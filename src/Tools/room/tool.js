import { EventFactory, Types } from "../../Event/index.js"
import { Provider } from "../../Provider/index.js"

export function RoomFactory({ ProviderFactory, outEvents }) {
    return function ToolFactory({ provider, currentMember, logging }) {

        const room = {}

        if(!provider)
            provider = ProviderFactory ? ProviderFactory() : new Provider()

        room.members = new Map

        if(outEvents?.length > 0)
            room.outEvent = EventFactory(Types.Any.Def(outEvents.map( event => event.type)))

        room.destroy = () => {
            for (const [uuid, _] of room.members) {
                room.deleteMember(uuid)
            }

            room.outEvent = null
        }

        room.addMember = (newMember) => {
            room.members.set(newMember.uid(), newMember)
            newMember.setOutsideRoom(room)
        }

        room.deleteMember = (uuid) => {
            const member = room.members.get(uuid)

            if(member) {
                room.members.delete(uuid)
                member.destroy()
            }
        }

        room.sendEvent = (msg) => {
            if(currentMember.isOutsideRoom() && ( !room.outEvent || room.outEvent.isValid(msg) ))
                currentMember.sendOutside(msg)

            try {
                provider.sendEvent(msg)
            }
            catch(err) {
                currentMember.throwError(err)
            }
        }

        room.subscribe = (msgType, callback, memberUuid, getSelfEvent, limit) => {

            if(!getSelfEvent) {
                const oldCallback = callback

                const structureEvent = JSON.parse(msgType.toJSON().type)

                if(!structureEvent.struct.sourceUuid)
                    throw TypeError("Type message require sourceUuid to not get self event!")

                callback = (msg) => {
                    if(memberUuid !== msg.sourceUuid)
                        oldCallback(msg)
                }
            }

            if(currentMember.isOutsideRoom())
                currentMember.subscribeOut(msgType, callback, memberUuid, getSelfEvent, limit)

            if(logging)
                logging.subscribe(msgType, memberUuid, getSelfEvent, limit)

            provider.onEvent(msgType, callback, memberUuid, limit)
        }

        room.unsubscribe = (msgType, memberUuid) => {

            if(currentMember.isOutsideRoom())
                currentMember.unsubscribeOut(msgType, memberUuid)

            provider.offEvent(msgType, memberUuid)
        }

        return room
    }
}