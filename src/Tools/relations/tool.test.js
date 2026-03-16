import test from 'ava'
import { MemberFactory } from '../../Member/index.js'
import { HashMap, Tool } from './tool.js'
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
  })
  
  member.tools.Relations.setRole('Tester')
  member.tools.Relations.sendPing()
  member.tools.Relations.sendPing()
  
  t.is(receivedPings[0].role, 'Tester')
  t.is(receivedPings[0].pingNumber, 1)
  t.is(receivedPings[1].pingNumber, 2)
  t.is(receivedPings[1].receivedPings, 0)
  t.is(receivedPings[0].sourceUuid, member.uid())
  t.is(receivedPings[0].status, "Created")
})

test('sendPing: периодическая отправка', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  
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
  client1.addTool(Tool)
  client2.addTool(Tool)
  
  // Клиенты подключаются к host
  host.addMember(client1)
  host.addMember(client2)
  
  const receivedPings = []
  host.subscribe(pingEvent, (payload) => {
    receivedPings.push(payload)
  })
  
  await later(600)
  
  t.true(receivedPings.length >= 4, `Ожидалось минимум 4 пинга, получено ${receivedPings.length}`)
  t.true(receivedPings.length <= 6, `Ожидалось максимум 6 пингов, получено ${receivedPings.length}`)
  
  const fromClient1 = receivedPings.filter(p => p.sourceUuid === client1.uid())
  const fromClient2 = receivedPings.filter(p => p.sourceUuid === client2.uid())
  
  t.true(fromClient1.length >= 2, `От client1 ожидалось минимум 2 пинга, получено ${fromClient1.length}`)
  t.true(fromClient2.length >= 2, `От client2 ожидалось минимум 2 пинга, получено ${fromClient2.length}`)
  t.truthy(fromClient1[0].parentUid)
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