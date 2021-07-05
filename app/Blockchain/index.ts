import Block from 'App/Models/Block'
import crypto from 'App/Utils/crypto'

interface NewBlock {
  publicKey: string
  nonce: number
  recipier: string
  value: number
  message?: string
  signature: string
}

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

  public async addBlock(block: NewBlock) {
    // todo: validar nonce
    // todo: validar recebedor
    // todo: validar valor
    // todo: validar assinatura
    // todo: validar saldo

    const sender = crypto.hash(block.publicKey)
    const hash = crypto.hash(`${block.nonce}${sender}${block.recipier}${block.value}${block.message}`)

    const prevBlock = await this.getLastBlock()
    const prevBlockHash = prevBlock?.hash

    return await Block.create({
      timestamp: new Date().getTime(),
      nonce: block.nonce,
      sender,
      recipier: block.recipier,
      value: block.value,
      message: block.message,
      publicKey: block.publicKey,
      signature: block.signature,
      hash,
      prevBlockHash,
    })
  }
}

export default new Blockchain()
