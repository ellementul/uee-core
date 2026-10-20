import { EventFactory, Types } from "../../Event/index.js"
import { Provider } from "../../Provider/index.js"
import { minimalExternalEvent, sourceEvent } from "./events.js"

export function RoomFactory({ ProviderFactory, inEvents, outEvents }) {
    return function ToolFactory({ provider, currentMember, logging }) {

        const room = {}

        if(!provider)
            provider = ProviderFactory ? ProviderFactory() : new Provider()

        room.members = new Map
        room.caches = new Map

        const checkMinimalEvent = event => {

            if(!minimalExternalEvent.isSubtypeEvent(event))
                throw new TypeError("Deprecated external events without correct fields { timestamp, sourceUid, hash }")

            return event.type
        }

        if(outEvents?.length > 0)
            room.outEvents = EventFactory(Types.Union.Def(outEvents.map(checkMinimalEvent)))
        else
            room.outEvents = minimalExternalEvent

        if(inEvents?.length > 0)
            room.inEvents = EventFactory(Types.Union.Def(inEvents.map(checkMinimalEvent)))
        else
            room.inEvents = minimalExternalEvent

        room.memberUid = () => currentMember.uid()

        room.children = () =>[...room.members.keys()]
        room.externalEventsCounter = 0

        room.destroy = () => {
            for (const [uid, _] of room.members) {
                room.deleteMember(uid)
            }

            room.outEvents = null
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
        room.checkCache = ({ sourceUid, timestamp, hash }) => {
            
            let source = room.caches.get(sourceUid)
            if (!source) {
                source = { cache: new Map(), maxTimestamp: 0 }
                room.caches.set(sourceUid, source)
            }

            const cache = source.cache

            if(source.maxTimestamp < timestamp) {
                source.maxTimestamp = timestamp
            }
            else {
                const cachedHash = cache.get(timestamp)

                if (cachedHash !== undefined) {
                    if (cachedHash === hash)
                        return false // Точный дубликат
                    
                    // Нарушение инварианта: источник выдал одинаковый timestamp для разных событий
                    throw new Error(`Cache invariant violated: sourceUid=${sourceUid}, timestamp=${timestamp} has different hashes`)
                }
            }
            
            cache.set(timestamp, hash)
            
            if (cache.size > CACHE_SOFT_LIMIT) {
                const oldestKey = cache.keys().next().value
                cache.delete(oldestKey)
            }
                
            return true
        }

        room.sendEvent = (msg) => {
            room.externalEventsCounter++
            
            if(currentMember.isOutsideRoom() && room.outEvents.isValid(msg)) {
                msg.timestamp = Date.now() + room.externalEventsCounter
                currentMember.sendOutside(msg)
            }

            try {
                provider.sendEvent(msg)
            }
            catch(err) {
                currentMember.throwError(err)
            }
        }

        room.subscribe = (msgType, callback, memberUid, getSelfEvent, limit) => {

            const oldCallback = callback
            callback = (msg) => {
                room.externalEventsCounter++
                oldCallback(msg)
            }

            if(!getSelfEvent) {
                const oldCallback = callback

                if(!sourceEvent.isSubtypeEvent(msgType))
                    throw TypeError("Type message require sourceUid to not get self event!")

                callback = (msg) => {
                    if(memberUid !== msg.sourceUid)
                        oldCallback(msg)
                }
            }

            if(currentMember.isOutsideRoom() && room.inEvents.isSubtypeEvent(msgType)) {

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