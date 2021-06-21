import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { Address } from 'App/Helpers'

export default class AddressesController {
  public async show({ params, response, logger }: HttpContextContract) {
    if (!Address.valid(params.address)) {
      logger.warn('The address is not a valid sha256 hash.')

      return response.unprocessableEntity({
        errors: [{ message: 'The address is not a valid hash.' }],
      })
    }

    const data = await Address.find(params.address)
    return response.ok(data)
  }
}
