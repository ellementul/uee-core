import { Types } from "../Event/index.js"
import { RoomFactory } from "../Tools/room.js"

export class MemberFactory {

    constructor() {
        this.tools = {}
        this._uuid = Types.UUID.Def().rand()

        this.subscribedOutEvents = new Map
    }

    get uuid() {
        return this._uuid
    }

    get isReadyToSend() {
        return !!(this.tools.room || this.outsideRoom)
    }

    addTool({ name, ToolFactory, depends: { required }}) {

        const selfLinkName = "currentMember"

        try {
            const depends = { [selfLinkName]: this }

            if(required)
                for (const [requiredName, requiredMethods] of required) {
                    if(requiredName === selfLinkName)
                        continue

                    if(!this.tools[requiredName])
                        throw TypeError(`Not found depend: ${requiredName}`)

                    const requiredTool = this.tools[requiredName]
                    for (const requiredMethod of requiredMethods) {
                        if(typeof requiredTool[requiredMethod] !== "function")
                            throw TypeError(`Not found method on depend tool: ${requiredName}.${requiredMethod}`)
                    }

                    depends[requiredName] = requiredTool
                }

            this.tools[name] = ToolFactory(depends)
        }
        catch(err) {
            this.throwError(err)
        }
    }

    makeRoom({ inEvents, outEvents } = {}) {
        try {
            if(inEvents?.length > 0)
                this.inEvents = new Set(inEvents.map(event => event.sign()))

            this.addTool({ name: "room", ToolFactory: RoomFactory({ outEvents }), depends: {}})

            this.addMember = this.tools.room.addMember
            this.deleteMember = this.tools.room.deleteMember
        }
        catch(err) {
            this.throwError(err)
        }
    }
 
    send(typeMsg, payload) {
        const msg = typeMsg.createMsg(payload, this.debug)
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

    subscribe(msgType, callback, memberUuid, limit) {
        try {
            limit = limit || -1
            memberUuid = memberUuid || this.uuid

            if(this.tools.room)
                this.tools.room.subscribe(msgType, callback, memberUuid, limit)
            else if(this.outsideRoom)
                this.subscribeOut(msgType, callback, memberUuid, limit)
            else
                throw new Error("It cannot subscribe, it isn't Room and it doesn't connect to Room")
        }
        catch(err) {
            this.throwError(err)
        }
    }

    unsubscribe(msgType, memberUuid) {
        try {
            memberUuid = memberUuid || this.uuid

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
        }
        catch(err) {
            this.throwError(err)
        }
    }

    subscribeOut(msgType, callback, memberUuid, limit) {
        try {
            if(this.inEvents && !this.inEvents.has(msgType.sign()))
                return

            const uid = this._uuid + "/" + memberUuid
            this.outsideRoom.subscribe(msgType, callback, uid + memberUuid, limit)
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

            const uid = this._uuid + "/" + memberUuid
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