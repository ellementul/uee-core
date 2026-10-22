This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
events.js
tool.js
tool.test.js
```

# Files

## File: events.js
```javascript
import { EventFactory, Types } from "../../Event/index.js"

export const system = "MemberNetwork"

export const pingEvent = EventFactory(Types.Object.Def({
    system,
    action: "Ping",
    pingNumber: Types.Index.Def(2**31 - 1),
    timestamp: Types.Index.Def(2**53 - 1),
    sourceUid: Types.Key.Def(3),
    role: Types.Key.Def(3),
    name: Types.Key.Def(),
    status: Types.Key.Def(3),
    runtime: Types.Index.Def(2**53 - 1),
    parentUid: Types.Union.Def(Types.Const.Def(undefined), Types.Key.Def(3)),
    children: Types.Array.Def(Types.Key.Def(3), 256, true),
    memberListSize: Types.Index.Def(1024*1024),
    memberListHash: Types.Key.Def(),
    receivedPings: Types.Index.Def(2**31 - 1),
    hash: Types.Key.Def(3)
}, true))
```

## File: tool.js
```javascript
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
        const timestamp = Date.now()
        const runtime = Date.now() - runTimestamp

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
        receivedPings: memberReceivedPings,  
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
```

## File: tool.test.js
```javascript
import test from 'ava'
import { MemberFactory } from '../../Member/index.js'
import { HashMap, RelationTool as Tool } from './tool.js'
import { pingEvent } from './events.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('sendPing: отправляет ping при вызове', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  
  const receivedPings = []
  member.subscribe(pingEvent, (payload) => {
    receivedPings.push(payload)
  }, true, "TestEnv")
  
  member.tools.Relations.setRole('Tester')
  member.tools.Relations.sendPing()
  member.tools.Relations.sendPing()
  
  t.is(receivedPings.length, 2)
  t.is(receivedPings[0].role, 'Tester')
  t.is(receivedPings[0].pingNumber, 1)
  t.is(receivedPings[0].receivedPings, 0)
  t.is(receivedPings[0].sourceUid, member.uid())
  t.is(receivedPings[0].status, "Created")
  t.is(receivedPings[0].memberListSize, 0)
  t.falsy(receivedPings[0].memberListHash)

  t.is(receivedPings[1].pingNumber, 2)
  t.is(receivedPings[1].receivedPings, 1)
  t.is(receivedPings[1].memberListSize, 1)
  t.truthy(receivedPings[1].memberListHash)
})

// test('sendPing: периодическая отправка', async t => {
//   const member = new MemberFactory()
//   member.strictValidationEvent = true
//   member.makeRoom()
//   member.addTool(Tool)
//   member.tools.Relations.setRole("member")
  
//   const receivedPings = []
//   member.subscribe(pingEvent, (payload) => {
//     receivedPings.push(payload)
//   })
  
//   await later(1)
  
//   t.true(receivedPings.length >= 1, `Ожидался минимум 1 пинг, получено ${receivedPings.length}`)
//   t.is(receivedPings[0].pingNumber, 1)
// })

// test('tool_requires_room_dependency', t => {
//   const host = new MemberFactory()
//   host.makeRoom()
  
//   const subordinate = new MemberFactory()
//   host.addMember(subordinate)
  
//   // У подчинённого нет своей комнаты — инструмент не должен добавиться
//   t.throws(() => {
//     subordinate.addTool(Tool)
//   }, {
//     message: /Not found depend: room/
//   })
  
//   // У хоста инструмент добавляется успешно
//   t.notThrows(() => {
//     host.addTool(Tool)
//   })
  
//   // Проверяем что пинг отправляется
//   const receivedPings = []
//   host.subscribe(pingEvent, (payload) => {
//     receivedPings.push(payload)
//   })
  
//   host.tools.Relations.setRole("host")
//   host.tools.Relations.sendPing()
  
//   t.is(receivedPings.length, 1)
//   t.is(receivedPings[0].pingNumber, 1)
//   t.is(receivedPings[0].children.length, 1)
//   t.falsy(receivedPings[0].parentUid)
// })

// test('two_clients_send_pings_to_host', async t => {
//   const host = new MemberFactory()
//   const client1 = new MemberFactory()
//   const client2 = new MemberFactory()
  
//   host.makeRoom()
//   client1.makeRoom()
//   client2.makeRoom()
  
//   // Инструмент только у клиентов
//   Tool.pingDelay = 50
//   client1.addTool(Tool)
//   client2.addTool(Tool)
//   client1.tools.Relations.setRole("client1")
//   client2.tools.Relations.setRole("client2")
  
//   // Клиенты подключаются к host
//   host.addMember(client1)
//   host.addMember(client2)
  
//   const gotClient1 = []
//   client1.subscribe(pingEvent, (payload) => {
//     if(payload.sourceUid != client1.uid()) {
//       gotClient1.push(payload)
//     }
//   }, null, "TestEnvClient1")

//   // client1.subscribe(pingEvent, console.log, false, client1.uid())

//   const gotClient2 = []
//   client2.subscribe(pingEvent, (payload) => {
//     if(payload.sourceUid != client2.uid())
//       gotClient2.push(payload)
//   }, null, "TestEnvClient2")

//   client2.tools.Relations.sendPing()
  
//   await later(100)
  
//   t.true(gotClient1.length >= 2, `От client1 ожидалось минимум 2 пинга, получено ${gotClient1.length}`)
//   t.is(gotClient1[0].parentUid, host.uid())
//   t.is(gotClient1[0].children.length, 0)
//   t.is(gotClient1[0].sourceUid, client2.uid())
//   t.is(gotClient1[1].memberListSize, 2)


//   t.true(gotClient2.length >= 2, `От client2 ожидалось минимум 2 пинга, получено ${gotClient2.length}`)
//   t.is(gotClient2[0].parentUid, host.uid())
//   t.is(gotClient2[0].children.length, 0)
//   t.is(gotClient2[0].sourceUid, client1.uid())
//   t.is(gotClient2[1].memberListSize, 2)

//   t.is(gotClient2[1].memberListHash, gotClient1[1].memberListHash)
// })

test('Hash consistency and eviction', (t) => {
    const map1 = new HashMap('ts', 3)
    const map2 = new HashMap('ts', 3)

    map1.set('a', { ts: 10 });
    map1.set('b', { ts: 20 });
    map1.set('c', { ts: 30 });

    map2.set('b', { ts: 20 });
    map2.set('c', { ts: 30 });
    map2.set('a', { ts: 10 });
    map2.set('d', { ts: 5 });

    t.is(map1.size, map2.size);
    t.is(map1.hash(), map2.hash());
});
```
