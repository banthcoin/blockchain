import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Blocks extends BaseSchema {
  protected tableName = 'blocks'

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
