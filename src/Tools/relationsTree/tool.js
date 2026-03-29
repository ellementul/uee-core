import { pingEvent } from "./events.js"

function ToolFactory() {
    
    const nodes = new Map
    const names = new Map

    const upsertNode = (nodeId) => {
        if(!nodes.has(nodeId) && nodeId)
            nodes.set(nodeId, { children: new Set, extraData: {} })
    }

    const upsertRelation = (parent, child) => {
        upsertNode(child)
        
        const childSet = nodes.get(parent).children

        if(!childSet.has(child))
            childSet.add(child)
    }

    const upsertName = (name, nodeId) => {

        let uid = names.get(name)
        for (let charsFromId = 0; uid !== nodeId; charsFromId++) {
            if(!names.has(name))
                names.set(name, nodeId)
            else
                name += nodeId[charsFromId]

            uid = names.get(name)
        }
        
        return name
    }

    const addNodeAttr = (nodeId, attrName, data) =>  {
        upsertNode(nodeId)

        nodes.get(nodeId).extraData[attrName] = data
    }

    const receivePing = ({
        role,
        name,
        sourceUid, 
        parentUid, 
        children 
    }) => {
        addNodeAttr(sourceUid, "role", role)
        addNodeAttr(sourceUid, "name", upsertName(name, sourceUid))
        

        if(parentUid) {
            upsertNode(parentUid)
            upsertRelation(parentUid, sourceUid)
        }

        children.forEach(child => upsertRelation(sourceUid, child))
    }

    return {
        subscribeEvents(subscribe) {
            subscribe(pingEvent, receivePing)
        },
        getNode(nodeId) {
            upsertNode(nodeId)

            return { ...nodes.get(nodeId).extraData }
        },
        getChildren(nodeId) {
            return Array.from(nodes.get(nodeId).children)
        },
        getNodeAttr(nodeId, attrName) {
            upsertNode(nodeId)

            return nodes.get(nodeId).extraData[attrName]
        },
        addNodeAttr,
        topology() {
            const edges = []
            const roles = []
            const names = []

            for (const [nodeId] of nodes) {

                roles.push([nodeId, this.getNodeAttr(nodeId, "role")])
                names.push([nodeId, this.getNodeAttr(nodeId, "name")])

                for (const childId of nodes.get(nodeId).children) {
                    edges.push([nodeId, childId])
                }
            }

            return { edges, roles, names }
        }
    }
}

export const LoggingTreeTool = {
    name: "LoggingTree",
    ToolFactory,
    depends: { 
        required: []
    }
}