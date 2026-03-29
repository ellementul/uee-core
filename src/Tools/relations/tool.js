import { hashFromMapByKeys } from "../../utils/hashOfKeysFromMap.js"
import sha1 from 'sha1'
import { pingEvent } from "./events.js"

function ToolFactory({ currentMember, room }) {
    let pingNumber = 0
    let receivedPings = 0
    let role = "UknownRole"
    let status = "Created"
    let runTimestamp = Date.now()
    let pingDelay = RelationTool.pingDelay || 250

    let makeJitter = delay => delay + delay * Math.random() / 10

    const memberList = new HashMap("receivedLastPingTime")

    const sendPing = () => {
        if(!currentMember.isReadyToSend())
            return

        pingNumber += 1
        const timestamp = Date.now().toString()
        const runtime = (Date.now() - runTimestamp).toString()

        const roomUid = currentMember.outsideRoomMemberUid()
        const children = room.children()

        currentMember.send(pingEvent, {
            pingNumber,
            timestamp,
            sourceUid: currentMember.uid(),
            name: currentMember.name(),
            role,
            status,
            runtime,
            parentUid: roomUid,
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
            setTimeout(recursiveTimer, makeJitter(pingDelay))
        }
    }

    setTimeout(recursiveTimer, 0)

    const receivePing = ({ 
        role: memberRole, 
        memberStatus, 
        sourceUid, 
        timestamp, 
        receivedPings: 
        memberReceivedPings,  
        memberListSize, 
        memberListHash, 
        parentUid, 
        children 
    }) => {
        receivedPings += 1

        const memberRecord = memberList.get(sourceUid) 

        let pingCount = 1
        let receivedFirstPingTime = Date.now().toString()
        let receivedLastPingTime = Date.now().toString()
        let memberSentFirstPingTime = timestamp
        let memberSentLastPingTime = timestamp

        if(memberRecord) {
            pingCount += memberRecord.pingsInfo.pingCount
            receivedFirstPingTime = memberRecord.pingsInfo.receivedFirstPingTime
            memberSentFirstPingTime = memberRecord.pingsInfo.sentFirstPingTime
        }


        const memberInfo = {
            memberRole,
            memberStatus,
            receivedLastPingTime,
            memberListSize,
            memberListHash,
            pingsInfo: {
                pingCount,
                memberReceivedPings,
                receivedFirstPingTime,
                memberSentFirstPingTime,
                memberSentLastPingTime
            },
            relations: {
                parentUid, 
                children
            }
        }

        memberList.set(sourceUid, memberInfo)
    }

    return {
        subscribeEvents(subscribe) {
            subscribe(pingEvent, receivePing)
        },
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

export const RelationTool = {
    name: "Relations",
    ToolFactory,
    pingDelay: 250,
    depends: { 
        required: [
            { requiredName: "currentMember" , requiredMethods: ["uid", "name", "isReadyToSend", "send", "throwError"]},
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

    keys() {
        return [...this.map.keys()]
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