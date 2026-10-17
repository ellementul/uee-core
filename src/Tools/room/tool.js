import { EventFactory, Types } from "../../Event/index.js"
import { Provider } from "../../Provider/index.js"
import sha1 from 'sha1'

export function RoomFactory({ ProviderFactory, outEvents }) {
    return function ToolFactory({ provider, currentMember, logging }) {

        const room = {}

        if(!provider)
            provider = ProviderFactory ? ProviderFactory() : new Provider()

        room.members = new Map
        room.caches = new Map

        if(outEvents?.length > 0)
            room.outEvent = EventFactory(Types.Any.Def(outEvents.map( event => event.type)))

        room.memberUid = () => currentMember.uid()

        room.children = () =>[...room.members.keys()]

        room.destroy = () => {
            for (const [uid, _] of room.members) {
                room.deleteMember(uid)
            }

            room.outEvent = null
        }

        room.addMember = (newMember) => {
            room.members.set(newMember.uid(), newMember)
            newMember.setOutsideRoom(room)
        }

        room.deleteMember = (uid) => {
            const member = room.members.get(uid)

            if(member) {
                room.members.delete(uid)
                member.leaveRoom(room.memberUid())
            }
        }

        const CACHE_SOFT_LIMIT = 100
        room.checkCache = (payload) => {

            if(!room.caches.has(room.memberUid()))
                room.caches.set(room.memberUid(), new Map)

            const cache = room.caches.get(room.memberUid())

            const time = parseInt(payload.timestamp)
            const timestamp = isNaN(time) ? Date.now() : time

            const currentHash = cache.get(timestamp)
            const newHash = sha1(JSON.stringify(payload))

            if(newHash == currentHash)
                return false

            cache.set(timestamp, newHash)

            if(cache.size > CACHE_SOFT_LIMIT)
                room.clearCache(cache)

            return true
        }

        room.clearCache = (cache) => {
            const oldTimestamp = Date.now() - 60 * (CACHE_SOFT_LIMIT / cache.size) * 1000

            for (const [timestamp] of cache) {
            if(timestamp < oldTimestamp)
                cache.delete(timestamp)
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

        room.subscribe = (msgType, callback, memberUid, getSelfEvent, limit) => {

            if(!getSelfEvent) {
                const oldCallback = callback

                const structureEvent = JSON.parse(msgType.toJSON().type)

                if(!structureEvent.struct.sourceUid)
                    throw TypeError("Type message require sourceUid to not get self event!")

                callback = (msg) => {
                    if(memberUid !== msg.sourceUid)
                        oldCallback(msg)
                }
            }

            if(currentMember.isOutsideRoom()) {
                const oldCallback = callback
                callback = (msg) => {
                    if(room.checkCache(msg))
                        oldCallback(msg)
                }
                currentMember.subscribeOut(msgType, callback, memberUid, getSelfEvent, limit)
            }

            if(logging) {
                const oldCallback = callback

                callback = (msg) => {
                    oldCallback(msg)
                    logging.receive(msgType, msg)
                }
            }

            provider.onEvent(msgType, callback, memberUid, limit)

            if(logging)
                logging.subscribe(msgType, memberUid, getSelfEvent, limit)
        }

        room.unsubscribe = (msgType, memberUid) => {

            if(currentMember.isOutsideRoom())
                currentMember.unsubscribeOut(msgType, memberUid)

            provider.offEvent(msgType, memberUid)
        }

        return room
    }
}