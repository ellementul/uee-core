import { loggingErrorEvent, loggingReceivingEvent, loggingSendingEvent, loggingSubscriptionEvent, outputEventsType } from "./events.js"
import sha1 from 'sha1'

function ToolFactory({ currentMember }) {
    let alwaysConsole = false

    return {
        currentMember,
        setAlwaysConsole (value) { 
            alwaysConsole = value 
        },
        sendError(error) {
            const timestamp = Date.now().toString()
            const errorPayload = {
                timestamp,
                sourceUuid: this.currentMember.uid(),
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
        subscribe(msgType, memberUuid, getSelfEvent, limit) {
            const timestamp = Date.now().toString()
            const msg = loggingSubscriptionEvent.createMsg({
                timestamp,
                sourceUuid: this.currentMember.uid(),
                subscribedMemberUuid: memberUuid,
                eventHash: sha1(msgType.toJSON().type),
                limit,
                getSelfEvent
            })

            if (this.currentMember.isReadyToSend())
                this.currentMember.sendEvent(msg)
        },
        send(typeMsg, payload) {
            const timestamp = Date.now().toString()
            const msg = loggingSendingEvent.createMsg({
                timestamp,
                sourceUuid: this.currentMember.uid(),
                eventHash: sha1(typeMsg.toJSON().type),
                msgHash: sha1(JSON.stringify(typeMsg.createMsg(payload))),
                isSendEvent: this.currentMember.isReadyToSend()
            })
            
            if(this.currentMember.isReadyToSend())
                this.currentMember.sendEvent(msg)
        },
        receive(typeMsg, fullMsg) {
            if(!outputEventsType.test(fullMsg))
                return

            const timestamp = Date.now().toString()
            const msg = loggingReceivingEvent.createMsg({
                timestamp,
                sourceUuid: this.currentMember.uid(),
                eventHash: sha1(typeMsg.toJSON().type),
                msgHash: sha1(JSON.stringify(fullMsg))
            })

            if(this.currentMember.isReadyToSend())
                this.currentMember.sendEvent(msg)
        }
    }
}

export const Tool = {
    name: "logging",
    ToolFactory,
    depends: { required: [{ requiredName: "currentMember" , requiredMethods: ["uid", "isReadyToSend", "sendEvent"]}] }
}