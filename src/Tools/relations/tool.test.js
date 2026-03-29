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

test('sendPing: периодическая отправка', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  member.tools.Relations.setRole("member")
  
  const receivedPings = []
  member.subscribe(pingEvent, (payload) => {
    receivedPings.push(payload)
  })
  
  await later(1)
  
  t.true(receivedPings.length >= 1, `Ожидался минимум 1 пинг, получено ${receivedPings.length}`)
  t.is(receivedPings[0].pingNumber, 1)
})

test('tool_requires_room_dependency', t => {
  const host = new MemberFactory()
  host.makeRoom()
  
  const subordinate = new MemberFactory()
  host.addMember(subordinate)
  
  // У подчинённого нет своей комнаты — инструмент не должен добавиться
  t.throws(() => {
    subordinate.addTool(Tool)
  }, {
    message: /Not found depend: room/
  })
  
  // У хоста инструмент добавляется успешно
  t.notThrows(() => {
    host.addTool(Tool)
  })
  
  // Проверяем что пинг отправляется
  const receivedPings = []
  host.subscribe(pingEvent, (payload) => {
    receivedPings.push(payload)
  })
  
  host.tools.Relations.setRole("host")
  host.tools.Relations.sendPing()
  
  t.is(receivedPings.length, 1)
  t.is(receivedPings[0].pingNumber, 1)
  t.is(receivedPings[0].children.length, 1)
  t.falsy(receivedPings[0].parentUid)
})

test('two_clients_send_pings_to_host', async t => {
  const host = new MemberFactory()
  const client1 = new MemberFactory()
  const client2 = new MemberFactory()
  
  host.makeRoom()
  client1.makeRoom()
  client2.makeRoom()
  
  // Инструмент только у клиентов
  Tool.pingDelay = 50
  client1.addTool(Tool)
  client2.addTool(Tool)
  client1.tools.Relations.setRole("client1")
  client2.tools.Relations.setRole("client2")
  
  // Клиенты подключаются к host
  host.addMember(client1)
  host.addMember(client2)
  
  const gotClient1 = []
  client1.subscribe(pingEvent, (payload) => {
    if(payload.sourceUid != client1.uid()) {
      gotClient1.push(payload)
    }
  }, null, "TestEnvClient1")

  // client1.subscribe(pingEvent, console.log, false, client1.uid())

  const gotClient2 = []
  client2.subscribe(pingEvent, (payload) => {
    if(payload.sourceUid != client2.uid())
      gotClient2.push(payload)
  }, null, "TestEnvClient2")

  client2.tools.Relations.sendPing()
  
  await later(100)
  
  t.true(gotClient1.length >= 2, `От client1 ожидалось минимум 2 пинга, получено ${gotClient1.length}`)
  t.is(gotClient1[0].parentUid, host.uid())
  t.is(gotClient1[0].children.length, 0)
  t.is(gotClient1[0].sourceUid, client2.uid())
  t.is(gotClient1[1].memberListSize, 2)


  t.true(gotClient2.length >= 2, `От client2 ожидалось минимум 2 пинга, получено ${gotClient2.length}`)
  t.is(gotClient2[0].parentUid, host.uid())
  t.is(gotClient2[0].children.length, 0)
  t.is(gotClient2[0].sourceUid, client1.uid())
  t.is(gotClient2[1].memberListSize, 2)

  t.is(gotClient2[1].memberListHash, gotClient1[1].memberListHash)
})

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