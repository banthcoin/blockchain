import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Block from 'App/Models/Block'

export default class AddressesController {
  public async show({ params, response, logger }: HttpContextContract) {
    const { address } = params

    if (!/\b[A-Fa-f0-9]{64}\b/.test(address)) {
      logger.warn('The address is not a valid sha256 hash.')

      return response.unprocessableEntity({
        errors: [{ message: 'The address is not a valid hash.' }],
      })
    }

    const blocks = await Block.query()
      .where({ sender: address })
      .orWhere({ recipier: address })
      .exec()

    const transactions = blocks.length

    const totalReceived = blocks
      .filter((block) => block.recipier === address)
      .map((block) => block.amount)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const totalSent = blocks
      .filter((block) => block.sender === address)
      .map((block) => block.amount)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const finalBalance = totalReceived - totalSent

    return response.ok({
      transactions,
      totalReceived,
      totalSent,
      finalBalance,
      blocks,
    })
  }
}
