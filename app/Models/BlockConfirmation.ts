import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class BlockConfirmation extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniq: string

  @column()
  public blockIndex: number

  @column()
  public miner: string

  @column()
  public rnd: string

  @column()
  public block: string

  @column()
  public difficulty: number

  @column()
  public reward: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
