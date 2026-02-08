import { loggingErrorEvent, loggingSubscriptionEvent } from "./events.js"

function ToolFactory({ currentMember }) {
    let alwaysConsole = false

    return {
        currentMember,
        setAlwaysConsole (value) { 
            alwaysConsole = value 
        },
        sendError (error) {
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
            
            try {
                if (this.currentMember.isReadyToSend())
                    currentMember.send(loggingErrorEvent, errorPayload)
                
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
        subscribe(msgType, memberUuid, limit) {
            const timestamp = Date.now().toString()
            this.currentMember.send(loggingSubscriptionEvent, {
                timestamp,
                uuid: this.currentMember.uid(),
                sourceUuid: memberUuid,
                eventHash: msgType.sign(),
                limit
            })
        }
    }
}

export const Tool = {
    name: "logging",
    ToolFactory,
    depends: { required: [{ requiredName: "currentMember" , requiredMethods: ["uid", "isReadyToSend", "send"]}] }
}