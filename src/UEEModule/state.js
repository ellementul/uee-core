export const STATES_CONSTATS = {
  BUILDED: 'BUILDED',
  LOADED: 'LOADED',
  RUNNING: 'RUNNING',
  SLEEPED: 'SLEEPED',
  READONLY: 'READONLY',
}

export class State {
  constructor () {
    this._state = STATES_CONSTATS.BUILDED
    this._preLoadState = [STATES_CONSTATS.BUILDED, STATES_CONSTATS.SLEEPED]
    this._preRunState = [STATES_CONSTATS.LOADED, STATES_CONSTATS.READONLY]
    this._preReadState = [STATES_CONSTATS.LOADED, STATES_CONSTATS.RUNNING]
    this._preSleepState = [STATES_CONSTATS.READONLY, STATES_CONSTATS.RUNNING]
  }

  getValue() {
    return this._state
  }

  checkState (allowStates) {
    if(!allowStates.includes(this._state))
      throw new Error(`Uncorrectly state: ${this._state} allowStates: ${allowStates}`)
    else
      return true
  }

  load () {
    this.checkState(this._preLoadState)
    this._state = STATES_CONSTATS.LOADED
  }

  run () {
    this.checkState(this._preRunState)
    this._state = STATES_CONSTATS.RUNNING
  }

  onlyread () {
    this.checkState(this._preReadState)
    this._state = STATES_CONSTATS.READONLY
  }

  sleep () {
    this.checkState(this._preSleepState)
    this._state = STATES_CONSTATS.SLEEPED
  }
}