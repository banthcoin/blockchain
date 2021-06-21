import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { Blockchain } from 'App/Helpers'
import Block from 'App/Models/Block'

export default class TransactionsController {
  public async store({ request, response, logger }: HttpContextContract) {
    const { publicKey } = await request.validate({
      schema: schema.create({
        publicKey: schema.string({ trim: true }),
      }),
    })

    const sender = Blockchain.getPublicKeyHash(publicKey)
    const { balance } = await Blockchain.getAddress(sender)

    const {
      nonce,
      recipier,
      amount: preamount,
      signature,
    } = await request.validate({
      schema: schema.create({
        nonce: schema.number([
          rules.unique({
            table: 'blocks',
            column: 'nonce',
            where: { sender },
          }),
        ]),
        recipier: schema.string({ trim: true }, [rules.regex(/\b[A-Fa-f0-9]{64}\b/)]),
        amount: schema.number([rules.range(1, 100000000000000000)]),
        signature: schema.string({ trim: true }),
      }),
    })

    const amount = +preamount.toFixed(0)
    const hash = Blockchain.sha256(`${nonce}${sender}${recipier}${amount}`)

    if (!Blockchain.verifySignature(publicKey, hash, signature)) {
      logger.warn('Signature verification failed.')

      return response.unprocessableEntity({
        errors: [{ message: 'Signature verification failed.' }],
      })
    }

    if (balance - amount < 0) {
      logger.warn('Insufficient balance to transfer.')

      return response.unprocessableEntity({
        errors: [{ message: 'Insufficient balance to transfer.' }],
      })
    }

    const prevBlock = await Block.getLastBlock()
    logger.debug(`Last block of the chain index: ${prevBlock?.index} hash: ${prevBlock?.hash}.`)

    const block = await Block.create({
      timestamp: new Date().getTime(),
      nonce,
      publicKey,
      sender,
      recipier,
      amount,
      signature,
      hash,
      prevBlockHash: prevBlock?.hash,
    })

    logger.debug(`Added block of the chain index: ${block.index} hash: ${block.hash}.`)
    logger.debug(`${block.toJSON()}`)

    return response.created(block)
  }
}
