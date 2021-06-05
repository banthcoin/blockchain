import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Blockchain from 'App/Blockchain'

export default class BlocksController {
  public async show({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const block = await blockchain.getBlockByHash(params.id)
    return response.ok(block)
  }

  public async store({ params, request, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        publicKey: schema.string(),
        nonce: schema.number(),
        recipier: schema.string(),
        value: schema.number(),
        message: schema.string.optional(),
        signature: schema.string(),
      }),
    })

    const blockchain = new Blockchain(params.token)
    const block = await blockchain.addBlock(data)

    return response.ok(block)
  }
}
