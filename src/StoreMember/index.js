const EMPTY_STATE = "Empty"
const NOT_SYNCED_STATE = "Not synced"
const SYNCED_STATE = "Synced"


export class StoreMember extends StatesMember {
    constructor() {
        super([EMPTY_STATE, NOT_SYNCED_STATE, SYNCED_STATE])

        this.setState(EMPTY_STATE)
    }
}