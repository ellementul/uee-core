import { Types } from "../Event/index.js"
import { RoomFactory } from "../Tools/room/tool.js"

export class MemberFactory {

    constructor() {
        this.tools = {}
        this._uuid = Types.UUID.Def().rand()

        this.subscribedOutEvents = new Map
    }

    uid() {
        return this._uuid
    }

    isReadyToSend() {
        return !!(this.tools.room || this.outsideRoom)
    }

    isOutsideRoom() {
        return !!this.outsideRoom
    }

    outsideRoomMemberUid() {
        return this?.outsideRoom?.memberUid()
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
                tool.subscribeEvents(this.subscribe.bind(this))
        }
        catch(err) {
            this.throwError(err)
        }
    }

    makeRoom({ inEvents, outEvents } = {}) {
        try {
            if(inEvents?.length > 0)
                this.inEvents = new Set(inEvents.map(event => event.sign()))

            this.addTool({ name: "room", ToolFactory: RoomFactory({ outEvents }), depends: { 
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
                    tool.subscribeEvents(this.subscribe.bind(this))
            }
        }
        catch(err) {
            this.throwError(err)
        }
    }
 
    send(typeMsg, payload) {
        const msg = typeMsg.createMsg(payload, this.strictValidationEvent)

        if(this.tools.logging)
            this.tools.logging.send(typeMsg, payload)

        this.sendEvent(msg)
    }

    sendEvent(msg) {
        if(this.tools.room)
            this.tools.room.sendEvent(msg)
        else if(this.outsideRoom)
            this.outsideRoom.sendEvent(msg)
        else
            throw new Error("It cannot send msg, it isn't Room and it doesn't connect to Room")
    }

    sendOutside(msg) {
        this.outsideRoom.sendEvent(msg)
    }

    subscribe(msgType, callback, getSelfEvent, memberUuid, limit) {

        if(getSelfEvent === undefined || getSelfEvent === null)
            getSelfEvent = true

        try {

            limit = limit || -1
            memberUuid = memberUuid || this.uid()

            if(this.tools.room) {
                this.tools.room.subscribe(msgType, callback, memberUuid, getSelfEvent, limit)
            } else if(this.outsideRoom)
                this.subscribeOut(msgType, callback, memberUuid, getSelfEvent, limit)
            else
                throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
        }
        catch(err) {
            this.throwError(err)
        }
    }

    unsubscribe(msgType, memberUuid) {
        try {
            memberUuid = memberUuid || this.uid()

            if(this.tools.room)
                this.tools.room.unsubscribe(msgType, memberUuid)
            else if(this.outsideRoom)
                this.unsubscribeOut(msgType, memberUuid)
            else
                throw new Error("It cannot unsubscribe, it isn't Room and it doesn't connect to Room")
        }
        catch(err) {
            this.throwError(err)
        }
    }

    setOutsideRoom(room) {
        try {
            this.outsideRoom = room

            if(typeof this.onJoinRoom == "function")
                this.onJoinRoom()

            for(const toolName in this.tools){
                const tool = this.tools[toolName]
                if(typeof tool.subscribeEvents == "function")
                    tool.subscribeEvents(this.subscribe.bind(this))
            }
        }
        catch(err) {
            this.throwError(err)
        }
    }

    subscribeOut(msgType, callback, memberUuid, getSelfEvent, limit) {
        try {
            if(this.inEvents && !this.inEvents.has(msgType.sign()))
                return

            this.outsideRoom.subscribe(msgType, callback, memberUuid, getSelfEvent, limit)
            this.subscribedOutEvents.set(memberUuid, msgType)

        }
        catch(err) {
            this.throwError(err)
        }
    }

    unsubscribeOut(msgType, memberUuid) {
        try {
            if(this.inEvents && !this.inEvents.has(msgType.sign()))
                return

            const uid = this.uid() + "/" + memberUuid
            this.outsideRoom.unsubscribe(msgType, uid)
            this.subscribedOutEvents.delete(memberUuid)

        }
        catch(err) {
            this.throwError(err)
        }
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

            if(this.outsideRoom) {
                for (const [uuid, typeMsg] of this.subscribedOutEvents) {
                    this.outsideRoom.unsubscribe(typeMsg, uuid)
                }
                this.outsideRoom = null
            }

            this.inEvents = null
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