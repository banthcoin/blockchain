import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Blockchain from 'App/Blockchain'

export default class BlocksController {
  public async store({ request, response }: HttpContextContract) {
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

    const block = await Blockchain.addBlock(data)
    return response.ok(block)
  }
}
