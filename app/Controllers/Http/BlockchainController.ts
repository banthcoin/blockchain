import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Blockchain from 'App/Blockchain'

export default class BlockchainController {
  public async chain({ response }: HttpContextContract) {
    const chain = await Blockchain.chain()
    return response.ok({ chain })
  }
}
