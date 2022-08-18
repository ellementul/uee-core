import { EVENT_NAME_CONSTATS } from "../../UEEManager/constants.js";
import { UEEStateModule } from "../../UEEModule/state-module.js";

describe("State Module Test", () => {
  let stateModule
  it("Constructor", () => {
    stateModule = new UEEStateModule()

    expect(stateModule).toBeDefined()
    expect(stateModule.state).toBeDefined()
  })
})