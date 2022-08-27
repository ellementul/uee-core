class UEEDBAdapter {

  constructor () {}

  async connection() {
    throw new Error("The abstarct method was called!")
  }

  async saveEntity ({ typeEntity, entity }) {
    throw new Error("The abstarct method was called!")
  }

  async getEntity ({ typeEntity, uuid }) {
    throw new Error("The abstarct method was called!")
  }

  async getAllEntities ({ typeEntity }) {
    throw new Error("The abstarct method was called!")
  }
}

module.exports = { UEEDBAdapter }