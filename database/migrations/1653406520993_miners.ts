import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Miners extends BaseSchema {
  protected tableName = 'miners'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('token').nullable()
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('token')
    })
  }
}
