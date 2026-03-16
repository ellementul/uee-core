import { hashFromMapByKeys } from "../../utils/hashOfKeysFromMap.js"
import sha1 from 'sha1'
import { pingEvent } from "./events.js"

function ToolFactory({ currentMember, room }) {
    let pingNumber = 0
    let receivedPings = 0
    let role = "DefaultMember"
    let status = "Created"
    let runTimestamp = Date.now()
    let pingDelay = 250

    const memberList = new HashMap("receivingTime")

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
            status,
            runtime,
            parentUid: roomUuid,
            children,
            memberListSize: memberList.size,
            memberListHash: memberList.hash(),
            receivedPings
        })
    }

    const recursiveTimer = () => {
        try {
            sendPing()
        } catch (error) {
            currentMember.throwError(error)
        } finally {
            setTimeout(recursiveTimer, pingDelay)
        }
    }

    setTimeout(recursiveTimer, 0)

    currentMember.subscribe(pingEvent, (ping) => {
        receivedPings += 1

        // add member
        console.log(ping)
        //memberList.set(memberInfo)
    }, false)

    return {
        setRole(newRole) {
            role = newRole || role
        },
        role() {
            return role
        },
        setStatus(newStatus) {
            status = newStatus || status
        },
        status() {
            return status
        },
        sendPing
    }
}

export const Tool = {
    name: "Relations",
    ToolFactory,
    depends: { 
        required: [
            { requiredName: "currentMember" , requiredMethods: ["uid", "isReadyToSend", "send", "throwError"]},
            { requiredName: "room", requiredMethods: ["children"]}
        ]
    }
}

export class HashMap  {
    constructor(sortProperty, maxSize = 64, hashFunction = sha1) {
        if(!sortProperty)
            throw new TypeError

        this.sortProperty = sortProperty
        this.maxSize = maxSize

        this.map = new Map
        this._hash = ""
        this.hashFunction = hashFunction
    }

    get size() {
        return this.map.size
    }

    hash() {
        return this._hash
    }

    get(key) {
        return this.map.get(key)
    }

    set(key, value) {
        if(!value[this.sortProperty])
            throw new TypeError

        this.map.set(key, value)

        if(this.map.size > this.maxSize) {
            let minimumKey

            for (const [key, value] of this.map) {
                if(!minimumKey)
                    minimumKey = key

                if(this.map.get(minimumKey)[this.sortProperty] > value[this.sortProperty])
                    minimumKey = key
            }

            this.map.delete(minimumKey)
        }
        
        
        this._hash = hashFromMapByKeys(this.map, this.hashFunction)
    }
}