import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Block from 'App/Models/Block'

export default class FirstBlockSeeder extends BaseSeeder {
  public async run() {
    await Block.firstOrCreate(
      { index: 1 },
      {
        timestamp: new Date().getTime(),
        nonce: 0,
        publicKey: 'first_block',
        sender: 'first_block',
        recipier: 'recipier',
        value: 100000000000000000,
        hash: 'first_block',
        signature: 'first_block',
      }
    )
  }
}
