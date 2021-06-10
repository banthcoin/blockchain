import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Block from 'App/Models/Block'

export default class BlockchainController {
  public async index({ response }: HttpContextContract) {
    const chain = await Block.all()
    return response.ok({ chain })
  }
}
