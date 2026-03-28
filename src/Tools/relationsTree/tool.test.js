import test from 'ava'
import { MemberFactory } from '../../Member/index.js'
import { LoggingTreeTool as Tool } from './tool.js'
import { pingEvent } from './events.js'

function later(delay) {
  return new Promise(resolve => setTimeout(resolve, delay))
}

test('Build tree', async t => {
  const member = new MemberFactory()
  member.strictValidationEvent = true
  member.makeRoom()
  member.addTool(Tool)
  
  const rootId = member.uid()
  const childId1 = "e0892762-c91a-46e2-9e5e-38560947ac41"
  const childId2 = "e0892762-c91a-46e2-9e5e-38560947ac42"
  const childId3 = "e0892762-c91a-46e2-9e5e-38560947ac43"

  member.send(pingEvent, {
    sourceUuid: rootId,
    parentUid: undefined,
    role: "Root",
    children: []
  })

  t.truthy(member.tools.LoggingTree)
  t.truthy(member.tools.LoggingTree.getNode(rootId))

  member.send(pingEvent, {
    role: "child1",
    parentUid: rootId,
    sourceUuid: childId1,
    children: []
  })

  t.truthy(member.tools.LoggingTree.getNode(childId1))
  t.deepEqual(member.tools.LoggingTree.getChildren(rootId), [childId1])

  member.send(pingEvent, {
    role: "child1",
    parentUid: undefined,
    sourceUuid: childId1,
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