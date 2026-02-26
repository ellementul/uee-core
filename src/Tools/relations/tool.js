import { hashFromMapByKeys } from "../../utils/hashOfKeysFromMap.js"
import sha1 from 'sha1'
import { pingEvent } from "./events.js"

function ToolFactory({ currentMember, room }) {
    let pingNumber = 0
    let receivedPings = 0
    let role = "DefaultMember"
    let runTimestamp = Date.now()

    const memberList = new Map

    const sendPing = () => {
        if(!currentMember.isReadyToSend())
            return

        pingNumber += 1
        const timestamp = Date.now().toString()
        const runtime = (Date.now() - runTimestamp).toString()

        const roomUuid = currentMember.outsideRoomMemberUid()
        const children = room.children()

        currentMember.send(pingEvent, {
            pingNumber,
            timestamp,
            sourceUuid: currentMember.uid(),
            role,
            runtime,
            parentUid: roomUuid,
            children,
            memberListSize: memberList.size,
            memberListHash: hashFromMapByKeys(memberList, sha1),
            receivedPings
        })
    }

    setInterval(sendPing, 250)

    currentMember.subscribe(pingEvent, (ping) => {
        receivedPings += 1

        let member = memberList.get(ping.sourceUuid)

        if(!member) {
            member = {}
            memberList.set(ping.sourceUuid, member)
        }

        console.log(ping)
    }, false)

    return {
        setRole(newRole) {
            role = newRole || role
        },
        sendPing
    }
}

export const Tool = {
    name: "Relations",
    ToolFactory,
    depends: { 
        required: [
            { requiredName: "currentMember" , requiredMethods: ["uid", "isReadyToSend", "send"]},
            { requiredName: "room", requiredMethods: ["children"]}
        ]
    }
}