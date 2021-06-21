import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Blockchain } from 'App/Helpers'

export default class AddressesController {
  public async show({ params, response, logger }: HttpContextContract) {
    if (!Blockchain.validAddress(params.address)) {
      logger.warn('The address is not a valid sha256 hash.')

      return response.unprocessableEntity({
        errors: [{ message: 'The address is not a valid hash.' }],
      })
    }

    const data = await Blockchain.getAddress(params.address)
    return response.ok(data)
  }
}
