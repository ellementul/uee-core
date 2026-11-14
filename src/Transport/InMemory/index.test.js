// src/Transport/InMemory/index.test.js

import test from 'ava'
import sinon from 'sinon'
import {
  MockConnection,
  SerializationMiddleware,
  HostConnectionFactory,
  ClientConnectionFactory,
  registry
} from './index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test.beforeEach(() => {
  registry.reset()
})

// === Тесты MockConnection ===

test('MockConnection: basic send and receive', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const callback = sinon.fake()
  conn2.onMessage(callback)
  
  conn1.send('test message')
  await later(10)
  
  t.true(callback.calledOnceWith('test message'))
})

test('MockConnection: delay works correctly', async t => {
  const conn1 = new MockConnection({ delay: 50 })
  const conn2 = new MockConnection({ delay: 50 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const callback = sinon.fake()
  conn2.onMessage(callback)
  
  const start = Date.now()
  conn1.send('test')
  
  await later(20)
  t.false(callback.called, 'Should not be called before delay')
  
  await later(50)
  t.true(callback.called, 'Should be called after delay')
  
  const elapsed = Date.now() - start
  t.true(elapsed >= 50, `Elapsed time should be >= 50ms, got ${elapsed}ms`)
})

test('MockConnection: error simulation', async t => {
  const conn1 = new MockConnection({ delay: 0, errorRate: 1.0 }) // 100% ошибок
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const errorCallback = sinon.fake()
  const messageCallback = sinon.fake()
  
  conn1.onError(errorCallback)
  conn2.onMessage(messageCallback)
  
  conn1.send('test')
  await later(10)
  
  t.true(errorCallback.calledOnce)
  t.true(errorCallback.firstCall.firstArg instanceof Error)
  t.false(messageCallback.called)
})

test('MockConnection: close triggers onClose', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const closeCallback1 = sinon.fake()
  const closeCallback2 = sinon.fake()
  
  conn1.onClose(closeCallback1)
  conn2.onClose(closeCallback2)
  
  conn1.close()
  await later(10)
  
  t.true(closeCallback1.calledOnce)
  t.true(closeCallback2.calledOnce, 'Pair should also be closed')
})

test('MockConnection: send after close triggers error', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const errorCallback = sinon.fake()
  conn1.onError(errorCallback)
  
  conn1.close()
  conn1.send('test')
  
  t.true(errorCallback.calledOnce)
  t.is(errorCallback.firstCall.firstArg.message, 'Connection is closed')
})

// === Тесты SerializationMiddleware ===

test('SerializationMiddleware: serializes and deserializes objects', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const middleware1 = new SerializationMiddleware(conn1)
  const middleware2 = new SerializationMiddleware(conn2)
  
  const callback = sinon.fake()
  middleware2.onMessage(callback)
  
  const testData = { foo: 'bar', num: 42, arr: [1, 2, 3] }
  middleware1.send(testData)
  
  await later(10)
  
  t.true(callback.calledOnce)
  t.deepEqual(callback.firstCall.firstArg, testData)
})

test('SerializationMiddleware: handles nested objects', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const middleware1 = new SerializationMiddleware(conn1)
  const middleware2 = new SerializationMiddleware(conn2)
  
  const callback = sinon.fake()
  middleware2.onMessage(callback)
  
  const testData = {
    level1: {
      level2: {
        level3: 'deep value'
      }
    }
  }
  middleware1.send(testData)
  
  await later(10)
  
  t.true(callback.calledOnce)
  t.deepEqual(callback.firstCall.firstArg, testData)
})

test('SerializationMiddleware: close propagates', async t => {
  const conn1 = new MockConnection({ delay: 0 })
  const conn2 = new MockConnection({ delay: 0 })
  conn1._setPair(conn2)
  conn2._setPair(conn1)
  
  const middleware1 = new SerializationMiddleware(conn1)
  const middleware2 = new SerializationMiddleware(conn2)
  
  const closeCallback = sinon.fake()
  middleware2.onClose(closeCallback)
  
  middleware1.close()
  await later(10)
  
  t.true(closeCallback.calledOnce)
})

// === Тесты HostConnectionFactory ===

test('HostConnectionFactory: registers in registry', t => {
  const host = new HostConnectionFactory({ name: 'test-host' })
  
  t.true(registry.has('test-host'))
  t.is(registry.get('test-host'), host)
  
  host.stop()
})

test('HostConnectionFactory: throws on duplicate name', t => {
  const host1 = new HostConnectionFactory({ name: 'duplicate' })
  
  t.throws(() => {
    new HostConnectionFactory({ name: 'duplicate' })
  }, { message: /already registered/ })
  
  host1.stop()
})

test('HostConnectionFactory: requires name', t => {
  t.throws(() => {
    new HostConnectionFactory({})
  }, { message: /name is required/ })
})

test('HostConnectionFactory: stop unregisters from registry', t => {
  const host = new HostConnectionFactory({ name: 'test-host' })
  
  t.true(registry.has('test-host'))
  
  host.stop()
  
  t.false(registry.has('test-host'))
})

// === Тесты ClientConnectionFactory ===

test('ClientConnectionFactory: connects to host', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 0 })
  const client = new ClientConnectionFactory({ delay: 0 })
  
  const hostCallback = sinon.fake()
  const clientCallback = sinon.fake()
  
  host.onConnection(hostCallback)
  client.onConnection(clientCallback, 'test-host')
  
  await later(10)
  
  t.true(hostCallback.calledOnce)
  t.true(clientCallback.calledOnce)
  
  host.stop()
  client.stop()
})

test('ClientConnectionFactory: error when host not found', async t => {
  const client = new ClientConnectionFactory({ delay: 0 })
  
  const errorCallback = sinon.fake()
  client.onError(errorCallback)
  
  client.onConnection(() => {}, 'non-existent-host')
  
  await later(10)
  
  t.true(errorCallback.calledOnce)
  t.is(errorCallback.firstCall.firstArg.message, 'Host "non-existent-host" not found')
  
  client.stop()
})

test('ClientConnectionFactory: requires host name', t => {
  const client = new ClientConnectionFactory({ delay: 0 })
  
  t.throws(() => {
    client.onConnection(() => {})
  }, { message: /Host name is required/ })
  
  client.stop()
})

// === Интеграционные тесты ===

test('Integration: host and client exchange messages', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 10 })
  const client = new ClientConnectionFactory({ delay: 10 })
  
  let hostConn, clientConn
  const hostMessages = []
  const clientMessages = []
  
  host.onConnection((conn) => {
    hostConn = conn
    conn.onMessage((msg) => hostMessages.push(msg))
  })
  
  client.onConnection((conn) => {
    clientConn = conn
    conn.onMessage((msg) => clientMessages.push(msg))
  }, 'test-host')
  
  await later(20)
  
  // Клиент отправляет хосту
  clientConn.send({ from: 'client', data: 'hello' })
  await later(30)
  
  t.is(hostMessages.length, 1)
  t.deepEqual(hostMessages[0], { from: 'client', data: 'hello' })
  
  // Хост отправляет клиенту
  hostConn.send({ from: 'host', data: 'world' })
  await later(30)
  
  t.is(clientMessages.length, 1)
  t.deepEqual(clientMessages[0], { from: 'host', data: 'world' })
  
  host.stop()
  client.stop()
})

test('Integration: multiple clients connect to host', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 0 })
  const client1 = new ClientConnectionFactory({ delay: 0 })
  const client2 = new ClientConnectionFactory({ delay: 0 })
  
  const hostConnections = []
  const client1Messages = []
  const client2Messages = []
  
  host.onConnection((conn) => {
    hostConnections.push(conn)
  })
  
  client1.onConnection((conn) => {
    conn.onMessage((msg) => client1Messages.push(msg))
  }, 'test-host')
  
  client2.onConnection((conn) => {
    conn.onMessage((msg) => client2Messages.push(msg))
  }, 'test-host')
  
  await later(20)
  
  t.is(hostConnections.length, 2, 'Host should have 2 connections')
  
  // Отправляем сообщения от хоста к клиентам
  hostConnections[0].send({ to: 'client1' })
  hostConnections[1].send({ to: 'client2' })
  
  await later(20)
  
  t.is(client1Messages.length, 1)
  t.deepEqual(client1Messages[0], { to: 'client1' })
  
  t.is(client2Messages.length, 1)
  t.deepEqual(client2Messages[0], { to: 'client2' })
  
  host.stop()
  client1.stop()
  client2.stop()
})

test('Integration: close propagates between host and client', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 0 })
  const client = new ClientConnectionFactory({ delay: 0 })
  
  let hostConn, clientConn
  const hostClose = sinon.fake()
  const clientClose = sinon.fake()
  
  host.onConnection((conn) => {
    hostConn = conn
    conn.onClose(hostClose)
  })
  
  client.onConnection((conn) => {
    clientConn = conn
    conn.onClose(clientClose)
  }, 'test-host')
  
  await later(20)
  
  // Клиент закрывает соединение
  clientConn.close()
  await later(20)
  
  t.true(clientClose.calledOnce)
  t.true(hostClose.calledOnce, 'Host should also receive close')
  
  host.stop()
  client.stop()
})

test('Integration: host stop closes all connections', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 0 })
  const client1 = new ClientConnectionFactory({ delay: 0 })
  const client2 = new ClientConnectionFactory({ delay: 0 })
  
  const client1Close = sinon.fake()
  const client2Close = sinon.fake()
  
  client1.onConnection((conn) => {
    conn.onClose(client1Close)
  }, 'test-host')
  
  client2.onConnection((conn) => {
    conn.onClose(client2Close)
  }, 'test-host')
  
  await later(20)
  
  host.stop()
  await later(20)
  
  t.true(client1Close.calledOnce)
  t.true(client2Close.calledOnce)
  
  client1.stop()
  client2.stop()
})

test('Integration: message order preserved between host and client', async t => {
  const host = new HostConnectionFactory({ name: 'test-host', delay: 15 })
  const client = new ClientConnectionFactory({ delay: 15 })
  
  let hostConn, clientConn
  const hostMessages = []
  const clientMessages = []
  
  host.onConnection((conn) => {
    hostConn = conn
    conn.onMessage((msg) => hostMessages.push(msg))
  })
  
  client.onConnection((conn) => {
    clientConn = conn
    conn.onMessage((msg) => clientMessages.push(msg))
  }, 'test-host')
  
  await later(30)
  
  // Клиент отправляет 10 сообщений
  const messageCount = 10
  for (let i = 0; i < messageCount; i++) {
    clientConn.send({ seq: i, from: 'client' })
  }
  
  await later(messageCount * 25 + 100)
  
  // Проверяем порядок на стороне хоста
  t.is(hostMessages.length, messageCount)
  for (let i = 0; i < messageCount; i++) {
    t.deepEqual(hostMessages[i], { seq: i, from: 'client' })
  }
  
  // Хост отправляет 10 сообщений
  for (let i = 0; i < messageCount; i++) {
    hostConn.send({ seq: i, from: 'host' })
  }
  
  await later(messageCount * 25 + 100)
  
  // Проверяем порядок на стороне клиента
  t.is(clientMessages.length, messageCount)
  for (let i = 0; i < messageCount; i++) {
    t.deepEqual(clientMessages[i], { seq: i, from: 'host' })
  }
  
  host.stop()
  client.stop()
})