class AbstractTransport {
  send () { throw new Error('This abstract method should be overwrite!')  } 
  onRecieve  () { throw new Error('This abstract method should be overwrite!')  } 
}

export { AbstractTransport }