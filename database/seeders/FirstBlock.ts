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
        recipier: '647ef1efe5e82fa9e7bf33ad17121aed3c7d74abcf2e04f899344dd1645554db',
        value: 1000000000,
        hash: 'first_block',
        signature: 'first_block',
      }
    )
  }
}
