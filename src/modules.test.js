import test from 'ava'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const srcDir = fileURLToPath(new URL('.', import.meta.url))

function sourceModules(dir) {
    const modules = []

    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry)

        if (statSync(path).isDirectory()) {
            modules.push(...sourceModules(path))
            continue
        }

        if (entry.endsWith('.js') && !entry.endsWith('.test.js') && !entry.includes('browser'))
            modules.push(path)
    }

    return modules
}

test('every source module can be imported', async t => {
    const modules = sourceModules(srcDir)

    t.true(modules.length > 0)

    for (const module of modules)
        await t.notThrowsAsync(
            () => import(pathToFileURL(module).href),
            relative(srcDir, module)
        )
})
