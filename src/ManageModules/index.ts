import EventEmitter from 'events'


// TODO move in types file
const enum MessageType {
  CONNECTION_TYPE = 'Connection',
  NODES_SERVICE_TYPE = 'ModulesService',
  TEVENTS_SERVICE = 'EventsService'
}

interface Message {
  type: MessageType
  nodeUid: string,
  data: object
}

class ManageModules {
  private nodesList: Node[]
  private emitter = new EventEmitter

  public connectClient () {

  }

  public receiveMessage() {
    
  }

  private sendEvent() {
    
  }

  public sendMessageNodes () {

  }

  public sendMessageAllNodes () {

  }

  public updateEventsList () {

  }

  // Add listener for js events

  public onSendingMessage () {

  }
}

export { ManageModules }