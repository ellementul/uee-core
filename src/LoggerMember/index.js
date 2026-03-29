import { MemberFactory } from "../Member/index.js"
import { LogTool } from "../Tools/logging/tool.js"
import { RelationTool } from "../Tools/relations/tool.js"
import { LoggingTreeTool } from "../Tools/relationsTree/tool.js"


import fs from 'fs'

export class LoggerFactory extends MemberFactory {
    constructor(name = "LoggerMember") {
        super(name)

        this.makeRoom()
        this.addTool(LogTool)
        this.addTool(RelationTool)
        this.tools.Relations.setRole("Logger")
        this.addTool(LoggingTreeTool)
    }

    genTopologyToMd() {
        const { roles, edges, names } = this.tools.LoggingTree.topology()

        const mdCode = generateMermaid(names, edges)

        writeFileSync("./mermaid.md", mdCode)
    }
}

function generateMermaid(defs, connections) {
    let code = '```mermaid\n flowchart TD\n'

    defs.forEach(([id, name]) => code += `    ${id}[${name}]\n`)

    code += `\n`

    connections.forEach(([from, to]) => code += `    ${from} --> ${to}\n`)

    code += '```\n'
    return code
}

function writeFileSync(path, content) {
  fs.writeFileSync(path, content, 'utf8');
}