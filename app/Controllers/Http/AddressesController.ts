import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Blockchain from 'App/Blockchain'

export default class AddressesController {
  public async show({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const data = await blockchain.getAddress(params.address)
    return response.ok(data)
  }
}
