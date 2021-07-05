import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Block extends BaseModel {
  @column({ isPrimary: true })
  public index: number

  @column()
  public timestamp: number

  @column()
  public publicKey: string

  @column()
  public nonce: number

  @column()
  public sender: string

  @column()
  public recipier: string

  @column()
  public value: number

  @column()
  public message?: string

  @column()
  public signature: string

  @column()
  public hash: string

  @column()
  public prevBlockHash?: string
}
