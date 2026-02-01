import { EventFactory, Types } from '../Event/index.js'

export const loggingErrorType = Types.Object.Def({
    system: "Logging",
    action: "Error",
    timestamp: Types.Key.Def(),
    sourceUuid: Types.UUID.Def(),
    error: {
        message: Types.String.Def(),
        stack: Types.String.Def(),
        name: Types.String.Def()
    }
}, true)

export const loggingErrorEvent = EventFactory(loggingErrorType)

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
                sourceUuid: this.currentMember.uuid,
                error: {
                    message: error.message || "Unknown error",
                    stack: error.stack || "",
                    name: error.name || "Error"
                }
            }
            
            try {
                if (this.currentMember.isReadyToSend)
                    currentMember.send(loggingErrorEvent, errorPayload)
                
                if (!this.currentMember.isReadyToSend || alwaysConsole)
                    console.error(
                        `[${(new Date()).toISOString()}] [${currentMember.uuid}]`,
                        error
                    )
            } catch(err) {
                console.log(
                    `[${(new Date()).toISOString()}] [${currentMember.uuid}]`,
                    err
                )
            }
        }
    }
}

export const Tool = {
    name: "logging",
    ToolFactory,
    depends: { required: [["currentMember", []]] }
}