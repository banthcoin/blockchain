import Block from 'App/Models/Block'

class Blockchain {
  public async chain() {
    return await Block.all()
  }

  public async getBlock(index: number) {
    return await Block.find(index)
  }

  public async getBlockByHash(hash: string) {
    return await Block.findBy('hash', hash)
  }

  public async getLastBlock() {
    return await Block.query().orderBy('index', 'desc').first()
  }
}

export default new Blockchain()
