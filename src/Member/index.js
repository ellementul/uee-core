import { Types } from "../Event/index.js"
import { minimalExternalEvent, sourceEvent } from "./events.js"
import { RoomFactory } from "../Tools/room/tool.js"

const CACHE_LIMIT = 100

export class MemberFactory {

    constructor(name = "Member") {
        this.tools = {}
        this._uid = Types.Key.Def(40).rand().slice(0, 40).replace("_", "")
        this._name = name

        this.outsideRooms = new Map()
        this.subscribedOutEvents = new Map

        this.caches = new Map()
    }

    uid() {
        return this._uid
    }

    name() {
        return this._name
    }

    isReadyToSend() {
        return !!(this.tools.room || this.isOutsideRoom())
    }

    isOutsideRoom() {
        return this.outsideRooms.size > 0
    }

    outsideRoomMemberUid() {
        return [...this.outsideRooms.values()].map(room => room.memberUid())[0]
    }

    roomUids() {
        const rooms = [...this.outsideRooms.values()].map(room => room.memberUid())
        
        if(this.tools.room)
            rooms.unshift(this.uid())

        return rooms
    }

    addTool({ name, ToolFactory, depends: { required, optional }}) {

        const selfLinkName = "currentMember"

        try {
            const depends = { [selfLinkName]: this }

            if(required)
                for (const { requiredName, requiredMethods = [] } of required) {
                    if(requiredName === selfLinkName){
                        for (const requiredMethod of requiredMethods) {
                            if(requiredMethod == "subscribe")
                                throw TypeError(`
                                    Not use subscribe outside subscribeEvents method in tool!
                                    Or use room.subscribe tool method direct!
                                `)

                            if(typeof this[requiredMethod] !== "function")
                                throw TypeError(`Not found method on depend tool: ${requiredName}.${requiredMethod}`)
                        }

                        continue
                    }

                    if(!this.tools[requiredName])
                        throw TypeError(`Not found depend: ${requiredName}`)

                    const requiredTool = this.tools[requiredName]
                    for (const requiredMethod of requiredMethods) {
                        if(typeof requiredTool[requiredMethod] !== "function")
                            throw TypeError(`Not found method on depend tool: ${requiredName}.${requiredMethod}`)
                    }

                    depends[requiredName] = requiredTool
                }

            if(optional)
                for (const  { requiredName, requiredMethods = [] } of optional) {
                    if(requiredName === selfLinkName)
                        continue

                    
                    if(this.tools[requiredName]) {
                        let isOptionalTool = true
                        const optionalTool = this.tools[requiredName]
                        for (const requiredMethod of requiredMethods) {
                            if(typeof optionalTool[requiredMethod] !== "function")
                                isOptionalTool = false
                        }

                        if(isOptionalTool)
                            depends[requiredName] = optionalTool
                    }
                }

            this.tools[name] = ToolFactory(depends)

            const tool = this.tools[name]
            if(typeof tool.subscribeEvents == "function" && this.isReadyToSend())
                tool.subscribeEvents(this.subscribeTool.bind(this), this.roomUids())
        }
        catch(err) {
            this.throwError(err)
        }
    }

    makeRoom({ provider, inEvents, outEvents } = {}) {
        try {
            if(inEvents?.length > 0)
                this.inEvents = new Set(inEvents.map(event => event.sign()))

            this.addTool({ name: "room", ToolFactory: RoomFactory({ provider, outEvents, inEvents }), depends: {
                required: [{ requiredName: "currentMember", requiredMethods: [
                    "isOutsideRoom",
                    "sendOutside",
                    "throwError",
                    "subscribeOut",
                    "unsubscribeOut"
                ] }],
                optional: [{ requiredName: "logging", requiredMethods: ["subscribe", "receive"]}]
            }})

            this.addMember = this.tools.room.addMember
            this.deleteMember = this.tools.room.deleteMember

            for(const toolName in this.tools){
                const tool = this.tools[toolName]
                if(typeof tool.subscribeEvents == "function")
                    tool.subscribeEvents(this.subscribeTool.bind(this), [this.uid()])
            }
        }
        catch(err) {
            this.throwError(err)
        }
    }
 
    send(typeMsg, payload) {
        if (sourceEvent.isSubtypeEvent(typeMsg.type) && !payload.sourceUid)
            payload.sourceUid = this.uid()

        const msg = typeMsg.createMsg(payload, this.strictValidationEvent)

        if(this.tools.logging)
            this.tools.logging.send(typeMsg, msg)
        
        this.sendEvent(msg)
    }

    sendEvent(msg) {
        if(this.tools.room)
            this.tools.room.sendEvent(msg)
        else if(this.isOutsideRoom())
            this.sendOutside(msg)
        else
            throw new Error("It cannot send msg, it isn't Room and it doesn't connect to Room")
    }

    sendOutside(msg) {
        for(const [uid, room] of this.outsideRooms) {
            room.sendEvent(msg)
        }
    }

    
    checkCache ({ sourceUid, timestamp, hash }) {
            
        let source = this.caches.get(sourceUid)
        if (!source) {
            source = { cache: new Map(), maxTimestamp: 0 }
            this.caches.set(sourceUid, source)
        }

        const cache = source.cache

        if(source.maxTimestamp < timestamp) {
            source.maxTimestamp = timestamp
        }
        else {
            const cachedHash = cache.get(timestamp)

            if (cachedHash !== undefined && cachedHash === hash)
                return false
        }
        
        cache.set(timestamp, hash)
        
        if (cache.size > CACHE_LIMIT) {
            const oldestKey = cache.keys().next().value
            cache.delete(oldestKey)
        }
            
        return true
    }

    subscribe(msgType, callback, getSelfEvent, memberUid, limit) {

        if(getSelfEvent === undefined || getSelfEvent === null)
            getSelfEvent = true

        try {

            limit = limit || -1
            memberUid = memberUid || this.uid()

            if(minimalExternalEvent.isSubtypeEvent(msgType)) {
                const oldCallback = callback
                callback = (msg) => {
                    if(this.checkCache(msg))
                        oldCallback(msg)
                }
            }


            if(this.tools.room) {
                this.tools.room.subscribe(msgType, callback, memberUid, getSelfEvent, limit)
            } else if(this.isOutsideRoom())
                this.subscribeOut(msgType, callback, memberUid, getSelfEvent, limit)
            else
                throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
        }
        catch(err) {
            this.throwError(err)
        }
    }

    subscribeTool(msgType, callback, toolName, getSelfEvent = true) {
        this.subscribe(msgType, callback, getSelfEvent, `${this.uid()}:tool:${toolName}`)
    }

    unsubscribe(msgType, memberUid) {
        try {
            memberUid = memberUid || this.uid()

            if(this.tools.room)
                this.tools.room.unsubscribe(msgType, memberUid)
            else if(this.isOutsideRoom())
                this.unsubscribeOut(msgType, memberUid)
            else
                throw new Error("It cannot unsubscribe, it isn't Room and it doesn't connect to Room")
        }
        catch(err) {
            this.throwError(err)
        }
    }

    setOutsideRoom(room) {
        try {
            const roomUid = room.memberUid()
            this.outsideRooms.set(roomUid, room)
            
            if(typeof this.onJoinRoom == "function")
                this.onJoinRoom(roomUid)

            for(const toolName in this.tools){
                const tool = this.tools[toolName]

                if(typeof tool.subscribeEvents == "function") {
                    tool.subscribeEvents(this.subscribeTool.bind(this), [roomUid])
                }
            }
        }
        catch(err) {
            this.throwError(err)
        }
    }

    subscribeOut(msgType, callback, memberUid, getSelfEvent, limit) {
        for(const [_, room] of this.outsideRooms) {
            try {
                room.subscribe(msgType, callback, memberUid, getSelfEvent, limit)
            }
            catch(err) {
                this.throwError(err)
            }
        }

        this.subscribedOutEvents.set(memberUid, msgType)
    }

    unsubscribeOut(msgType, memberUid) {
        for(const [uid, room] of this.outsideRooms) {
            try {
                if(this.inEvents && !this.inEvents.has(msgType.sign()))
                    return

                room.unsubscribe(msgType, memberUid)
            }
            catch(err) {
                this.throwError(err)
            }
        }

        this.subscribedOutEvents.delete(memberUid)
    }

    destroy() {
        try {
            if(typeof this.onDestroy === "function")
                this.onDestroy()

            for (const toolName in this.tools) {
                const tool = this.tools[toolName]
                if(typeof tool.destroy === "function")
                    tool.destroy()
            }

            if(this.isOutsideRoom()) {
                for(const [roomUid, room] of this.outsideRooms) {
                    room.deleteMember(this.uid())
                    this.outsideRooms.delete(roomUid)
                }
            }

            this.inEvents = null
        }
        catch(err) {
            this.throwError(err)
        }
    }

    leaveRoom(roomUid) {
        try {
            const room = this.outsideRooms.get(roomUid)
            if(room) {
                for (const [uid, typeMsg] of this.subscribedOutEvents)
                    room.unsubscribe(typeMsg, uid)

                this.outsideRooms.delete(roomUid)
            }
        }
        catch(err) {
            this.throwError(err)
        }
    }


    throwError(err) {
        if(this.tools.logging)
            this.tools.logging.sendError(err)
        else
            throw err
    }
}