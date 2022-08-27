const { SystemInterface } = require("./Interfaces/system-interface")
const changeStateOfModuleAction = 'Change module state';
const updateModuleStateAction = 'Updated module state';
const STATE_EVENT_NAME_CONSTATS = {
  BUILD: '_build',
  LOAD: '_load',
  RUN: '_run',
  SLEEP: '_sleep',
  ONLYREAD: '_onlyRead',
  STOP: '_stop',
  UPDATE_MODULE_STATE: '_updateModuleState',
}
const SYSTEN_READY_EVENT_NAME = "_systemIsReady";

const stateEvents = Object.values(STATE_EVENT_NAME_CONSTATS).map(
  name => {
    const action = name == STATE_EVENT_NAME_CONSTATS.UPDATE_MODULE_STATE ? updateModuleStateAction : changeStateOfModuleAction
    return { 
      name, 
      payloadType: { action }, 
      tags: ["action"] 
    }
  }
)

const moduleManagerSystem = new SystemInterface({
  name: "moduleManageSystem",
  events: [
    ...stateEvents,
    { name: SYSTEN_READY_EVENT_NAME }
  ]
})

module.exports = {
  changeStateOfModuleAction,
  updateModuleStateAction,
  STATE_EVENT_NAME_CONSTATS,
  SYSTEN_READY_EVENT_NAME,
  moduleManagerSystem
}