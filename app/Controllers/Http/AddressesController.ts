import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Blockchain from 'App/Blockchain'

export default class AddressesController {
  public async show({ params, response }: HttpContextContract) {
    const data = await Blockchain.getAddressInfo(params.address)
    return response.ok(data)
  }
}
