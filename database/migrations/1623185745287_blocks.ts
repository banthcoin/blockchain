import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Blocks extends BaseSchema {
  protected tableName = 'blocks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('index')
      table.bigInteger('timestamp').notNullable()
      table.bigInteger('nonce').notNullable()
      table.string('public_key').notNullable()
      table.string('sender').notNullable()
      table.string('recipier').notNullable()
      table.bigInteger('value').notNullable()
      table.string('message').nullable()
      table.string('signature').notNullable()
      table.string('hash').notNullable()
      table.string('prev_block_hash').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
