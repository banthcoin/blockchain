import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

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
  public prevBlockHash?: string

  public static async getLastBlock() {
    return await Block.query().orderBy('index', 'desc').first()
  }
}
