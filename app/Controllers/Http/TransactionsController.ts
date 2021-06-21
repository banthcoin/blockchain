import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import crypto from 'crypto'
import { Address } from 'App/Helpers'
import Block from 'App/Models/Block'

function sha256(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function verifySignature(publicKey: string, hash: string, signature: string) {
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.write(hash)
  verifier.end()

  return verifier.verify(publicKey, signature, 'hex')
}

function getPublicKeyHash(publicKey: string) {
  const data = publicKey
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/[\n\r]/g, '')

  return sha256(data)
}

export default class TransactionsController {
  public async store({ request, response, logger }: HttpContextContract) {
    const { publicKey } = await request.validate({
      schema: schema.create({
        publicKey: schema.string({ trim: true }),
      }),
    })

    const sender = getPublicKeyHash(publicKey)
    const { balance } = await Address.find(sender)

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

    const hash = sha256(`${nonce}${sender}${recipier}${amount}`)

    logger.debug(
      JSON.stringify({
        publicKey,
        nonce,
        sender,
        recipier,
        amount,
        hash,
        signature,
      })
    )

    if (!verifySignature(publicKey, hash, signature)) {
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

    return response.created(block)
  }
}
