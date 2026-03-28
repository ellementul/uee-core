import { MemberFactory } from "../Member/index.js"
import { LogTool } from "../Tools/logging/tool.js"
import { RelationTool } from "../Tools/relations/tool.js"
import { LoggingTreeTool } from "../Tools/relationsTree/tool.js"


import fs from 'fs'

export class RootFactory extends MemberFactory {
    constructor() {
        super()

        this.makeRoom()
        this.addTool(LogTool)
        this.addTool(RelationTool)
        this.tools.Relations.setRole("Root")
        this.addTool(LoggingTreeTool)
    }

    genTopologyToMd() {
        const { roles, edges } = this.tools.LoggingTree.topology()
        const mdCode = generateMermaid(roles, edges)

        writeFileSync("./mermaid.md", mdCode)
    }
}

function generateMermaid(defs, connections) {
    let code = '```mermaid\n flowchart TD\n'

    defs.forEach(([id, name]) => {
        const label = `${name}:${id.replace('-', '').slice(-4)}`
        code += `    ${id}[${label}]\n`
    })

    code += `\n`

    connections.forEach(([from, to]) => code += `    ${from} --> ${to}\n`)

    code += '```\n'
    return code
}

function writeFileSync(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}