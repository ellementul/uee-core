describe("Test for DB Module", () => {

  class fakeDB {

    constructor () {
      this.DB = {}
    }

    async connection() {
      mockConnection()
    }

    async saveEntity ({ typeEntity, entity }) {
      if(!this.DB[typeEntity])
        this.DB[typeEntity] = {}

      this.DB[typeEntity][entity.uuid] = entity
    }

    async getEntity ({ typeEntity, uuid }) {
      return this.DB[typeEntity][uuid]
    }

    async getAllEntities ({ typeEntity }) {
      return this.DB[typeEntity]
    }
  }

})