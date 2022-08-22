import { SystemInterface } from "./Interfaces/system-interface";
export const changeStateOfModuleAction = 'Change module state';
export const updateModuleStateAction = 'Updated module state';
export const STATE_EVENT_NAME_CONSTATS = {
  BUILD: '_build',
  LOAD: '_load',
  RUN: '_run',
  SLEEP: '_sleep',
  ONLYREAD: '_onlyRead',
  STOP: '_stop',
  UPDATE_MODULE_STATE: '_updateModuleState',
}
export const SYSTEN_READY_EVENT_NAME = "_systemIsReady";

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

const systemName = "moduleManageSystem"
export const moduleManagerSystem = new SystemInterface({
  name: systemName,
  events: [
    ...stateEvents,
    { name: SYSTEN_READY_EVENT_NAME }
  ]
})