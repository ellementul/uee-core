import test from 'ava'
import { performance } from 'node:perf_hooks'
import { MemberFactory, EventFactory, Types } from '../index.js'

const perfEvent = () => EventFactory(Types.Object.Def({
    system: 'Performance',
    i: Types.Index.Def(1e9)
}))

const latticeEvent = () => EventFactory(Types.Object.Def({
    system: 'Lattice',
    sourceUid: Types.Key.Def(3),
    timestamp: Types.Index.Def(2**53 - 1),
    hash: Types.Key.Def(3),
    i: Types.Index.Def(1e9)
}, true))

function createLattice(layerSize = 20, layers = 4) {
    const grid = Array.from({ length: layers }, (_, layer) =>
        Array.from({ length: layerSize }, (_, index) => new MemberFactory(`l${layer}n${index}`))
    )

    for (const layer of grid)
        for (const member of layer)
            member.makeRoom()

    // Каждый родитель получает двух детей: i и (i + 1) по кольцу.
    for (let layer = 0; layer < layers - 1; layer++) {
        for (let i = 0; i < layerSize; i++) {
            const parent = grid[layer][i]
            parent.addMember(grid[layer + 1][i])
            parent.addMember(grid[layer + 1][(i + 1) % layerSize])
        }
    }

    return grid
}

test('event propagation through a two-parent two-child lattice', t => {
    const LAYER_SIZE = 20
    const LAYERS = 4
    const grid = createLattice(LAYER_SIZE, LAYERS)
    const members = grid.flat()

    // Инварианты топологии: двое родителей и двое детей у средних слоёв.
    for (let layer = 0; layer < LAYERS; layer++) {
        for (const member of grid[layer]) {
            t.is(member.outsideRooms.size, layer === 0 ? 0 : 2, `layer ${layer}: parents`)
            t.is(member.tools.room.children().length, layer === LAYERS - 1 ? 0 : 2, `layer ${layer}: children`)
        }
    }

    const event = latticeEvent()
    let deliveries = 0
    const handler = () => { deliveries++ }

    for (const member of members)
        member.subscribe(event, handler)

    const EVENTS = 100
    const sender = grid[1][0] // средний слой: двое родителей и двое детей
    const started = performance.now()
    for (let i = 0; i < EVENTS; i++)
        sender.send(event, { i, timestamp: Date.now() + i, hash: `hash${i}` })
    const elapsed = performance.now() - started

    t.true(deliveries > EVENTS, `expected deliveries through the lattice, got ${deliveries}`)

    t.log(`layers: ${LAYERS}, per layer: ${LAYER_SIZE}, members: ${members.length}, events: ${EVENTS}, deliveries: ${deliveries}`)
    t.log(`elapsed: ${elapsed.toFixed(2)}ms, throughput: ${Math.round(deliveries / elapsed * 1000)} deliveries/s`)

    t.true(elapsed < 5000, `propagation took too long: ${elapsed.toFixed(2)}ms`)
})

test('event path overhead versus a direct callback', t => {
    const CALLS = 20000

    let directCalls = 0
    const callback = () => { directCalls++ }

    const directStarted = performance.now()
    for (let i = 0; i < CALLS; i++)
        callback()
    const directElapsed = performance.now() - directStarted

    const member = new MemberFactory('perf')
    member.makeRoom()

    const event = perfEvent()
    let eventCalls = 0
    member.subscribe(event, () => { eventCalls++ })

    const eventStarted = performance.now()
    for (let i = 0; i < CALLS; i++)
        member.send(event, { i })
    const eventElapsed = performance.now() - eventStarted

    t.is(eventCalls, CALLS)

    const comparableDirect = Math.max(directElapsed, 0.1)
    const ratio = eventElapsed / comparableDirect
    t.log(`direct callback: ${directElapsed.toFixed(2)}ms, event path: ${eventElapsed.toFixed(2)}ms, overhead: >=${ratio.toFixed(1)}x`)
    t.log(`event throughput: ${Math.round(CALLS / eventElapsed * 1000)} events/s`)

    t.true(Number.isFinite(ratio), 'overhead ratio is not finite')
    t.true(eventElapsed < 5000, `event path took too long: ${eventElapsed.toFixed(2)}ms`)
})
