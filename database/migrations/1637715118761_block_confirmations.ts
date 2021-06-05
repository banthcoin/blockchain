import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class BlockConfirmations extends BaseSchema {
  protected tableName = 'block_confirmations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('uniq').notNullable().unique()
      table.integer('block_index').notNullable()
      table.string('miner').notNullable()
      table.string('rnd').notNullable()
      table.string('block').notNullable()
      table.integer('difficulty').notNullable()
      table.integer('reward').notNullable()

      /**
       * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
