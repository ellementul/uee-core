import EventEmitter from 'events'


// TODO move in types file
const enum MessageType {
  CONNECTION_TYPE = 'Connection',
  NODES_SERVICE_TYPE = 'NodesService',
  EVENTS_SERVICE = 'EventsService'
}

interface Message {
  type: MessageType
  nodeUid: string,
  data: object
}

class Node {
  public uid: string
  public clientUid: string

  public send () {

  }

  public receive () {

  }
}

class Nodes {
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

export { Nodes }