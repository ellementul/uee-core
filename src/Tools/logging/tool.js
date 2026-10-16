import { loggingErrorEvent, loggingReceivingEvent, loggingSendingEvent, loggingSubscriptionEvent, loggingAddParentEvent, outputEventsType } from "./events.js"
import sha1 from 'sha1'

function ToolFactory({ currentMember }) {
    let alwaysConsole = false

    return {
        currentMember,
        subscribeEvents(_, roomUids) {
            for(const roomUid of roomUids) {
                const timestamp = Date.now().toString()
                const msg = loggingAddParentEvent.createMsg({
                    timestamp,
                    sourceUid: this.currentMember.uid(),
                    sourceName: this.currentMember.name(),
                    parentUid: roomUid
                })

                if(this.currentMember.isReadyToSend())
                    this.currentMember.sendEvent(msg)
            }       
        },
        setAlwaysConsole (value) { 
            alwaysConsole = value 
        },
        sendError(error) {
            const timestamp = Date.now().toString()
            const errorPayload = {
                timestamp,
                sourceUid: this.currentMember.uid(),
                sourceName: this.currentMember.name(),
                error: {
                    message: error.message || "Unknown error",
                    stack: error.stack || "",
                    name: error.name || "Error"
                }
            }
            const msg = loggingErrorEvent.createMsg(errorPayload)
            
            try {
                if (this.currentMember.isReadyToSend())
                    this.currentMember.sendEvent(msg)
                
                if (!this.currentMember.isReadyToSend() || alwaysConsole)
                    console.error(
                        `[${(new Date()).toISOString()}] [${currentMember.uid()}]`,
                        error
                    )
            } catch(err) {
                console.log(
                    `[${(new Date()).toISOString()}] [${currentMember.uid()}]`,
                    err
                )
            }
        },
        subscribe(msgType, memberUid, getSelfEvent, limit) {
            const roomUids = this.currentMember.roomUids()

            if (this.currentMember.isReadyToSend())
                for(const roomUid of roomUids) {
                    const timestamp = Date.now().toString()
                    const msg = loggingSubscriptionEvent.createMsg({
                        timestamp,
                        sourceUid: this.currentMember.uid(),
                        subscribedMemberUid: memberUid,
                        parentUid: roomUid,
                        eventHash: sha1(msgType.toJSON().type),
                        limit,
                        getSelfEvent
                    })

                    
                    this.currentMember.sendEvent(msg)
                }
        },
        send(typeMsg, payload) {
            const roomUids = this.currentMember.roomUids()

            if(this.currentMember.isReadyToSend())
                for(const roomUid of roomUids) {
                    const timestamp = Date.now().toString()
                    const msg = loggingSendingEvent.createMsg({
                        timestamp,
                        sourceUid: this.currentMember.uid(),
                        sourceName: this.currentMember.name(),
                        parentUid: roomUid,
                        eventHash: sha1(typeMsg.toJSON().type),
                        msgHash: sha1(JSON.stringify(typeMsg.createMsg(payload))),
                        isSendEvent: this.currentMember.isReadyToSend()
                    })
                    
                    
                    this.currentMember.sendEvent(msg)
                }
        },
        receive(typeMsg, fullMsg) {
            if(!outputEventsType.test(fullMsg))
                return

            const timestamp = Date.now().toString()
            const msg = loggingReceivingEvent.createMsg({
                timestamp,
                sourceUid: this.currentMember.uid(),
                sourceName:this.currentMember.name(),
                eventHash: sha1(typeMsg.toJSON().type),
                msgHash: sha1(JSON.stringify(fullMsg))
            })

            if(this.currentMember.isReadyToSend())
                this.currentMember.sendEvent(msg)
        }
    }
}

export const LogTool = {
    name: "logging",
    ToolFactory,
    depends: { required: [{ requiredName: "currentMember" , requiredMethods: ["uid", "name", "roomUids", "isReadyToSend", "sendEvent"]}] }
}
