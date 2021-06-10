import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import crypto from 'crypto'

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  public index: number

  @column()
  public timestamp: number

  @column()
  public nonce: number

  @column()
  public publicKey: string

  @column()
  public sender: string

  @column()
  public recipier: string

  @column()
  public amount: number

  @column()
  public signature: string

  @column()
  public hash: string

  @column()
  public prevBlockHash: string | null

  public static async getLastBlock() {
    return await Block.query().orderBy('index', 'desc').first()
  }

  public static hashBlock(block: {
    nonce: number
    publicKey: string
    sender: string
    recipier: string
    amount: number
  }) {
    return crypto
      .createHash('sha256')
      .update(`${block.nonce}.${block.publicKey}.${block.sender}.${block.recipier}.${block.amount}`)
      .digest('hex')
  }
}
