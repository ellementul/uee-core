import test from 'ava'
import { MemberFactory } from '../../Member/index.js'
import { LoggingTreeTool as Tool } from './tool.js'
import { pingEvent } from './events.js'
import { LoggerFactory } from '../../LoggerMember/index.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('Build tree', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  
  const rootId = member.uid()
  const childId1 = "38560947ac41"
  const childId2 = "38560947ac42"
  const childId3 = "38560947ac43"

  member.send(pingEvent, {
    sourceUid: rootId,
    parentUid: undefined,
    role: "Logger",
    name: "Root",
    children: []
  })

  t.truthy(member.tools.LoggingTree)
  t.truthy(member.tools.LoggingTree.getNode(rootId))
  t.is(member.tools.LoggingTree.getNodeAttr(rootId, "name"), "Root")

  member.send(pingEvent, {
    role: "child1",
    name: "Child",
    parentUid: rootId,
    sourceUid: childId1,
    children: []
  })

  t.truthy(member.tools.LoggingTree.getNode(childId1))
  t.deepEqual(member.tools.LoggingTree.getChildren(rootId), [childId1])
  t.is(member.tools.LoggingTree.getNodeAttr(childId1, "name"), "Child")

  member.send(pingEvent, {
    role: "child1",
    parentUid: undefined,
    sourceUid: childId1,
    children: [childId2, childId3]
  })

  t.deepEqual(member.tools.LoggingTree.getChildren(rootId), [childId1])
  t.deepEqual(member.tools.LoggingTree.getChildren(childId1), [childId2, childId3])

  const topology = member.tools.LoggingTree.topology()
  t.is(topology.edges.length, 3)
  t.is(topology.roles.length, 4)
})

test('Attrs', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  
  const rootId = "e0892762-c91a-46e2-9e5e-38560947ac40"

  t.falsy(member.tools.LoggingTree.getNodeAttr(rootId, "test"))

  member.tools.LoggingTree.addNodeAttr(rootId, "test", true)

  t.true(member.tools.LoggingTree.getNodeAttr(rootId, "test"))

  t.deepEqual(member.tools.LoggingTree.getNode(rootId), { test: true })

})


test('Duplicate names', async t => {
  const member = new LoggerFactory()
  member.strictValidationEvent = true
  
  const member2 = new LoggerFactory()
  member.addMember(member2)

  await later(1)

  t.is(member.tools.LoggingTree.getNodeAttr(member.uid(), "name"), "LoggerMember")
  t.is(member.tools.LoggingTree.getNodeAttr(member2.uid(), "name"), "LoggerMember" + member2.uid()[0])
})