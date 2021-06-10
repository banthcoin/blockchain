import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import crypto from 'crypto'
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

export default class TransactionsController {
  public async store({ request, response, logger }: HttpContextContract) {
    const { publicKey, sender, recipier, amount, signature } = await request.validate({
      schema: schema.create({
        publicKey: schema.string(),
        sender: schema.string(),
        recipier: schema.string(),
        amount: schema.number(),
        signature: schema.string(),
      }),
    })

    logger.info(`sender: ${sender}`)
    logger.info(`recipier: ${recipier}`)
    logger.info(`amount: ${amount}`)
    logger.info(`signature: ${signature}`)

    if (sender !== sha256(publicKey)) {
      logger.warn('The publicKey hash does not match the sender.')

      return response.unprocessableEntity({
        errors: [{ message: 'The publicKey sha256 hash does not match the sender.' }],
      })
    }

    if (!/\b[A-Fa-f0-9]{64}\b/.test(recipier)) {
      logger.warn('The receiver is not a valid sha256 hash.')

      return response.unprocessableEntity({
        errors: [{ message: 'The receiver is not a valid hash.' }],
      })
    }

    if (amount <= 0) {
      logger.warn('The value cannot be less than 0.')

      return response.unprocessableEntity({
        errors: [{ message: 'The value cannot be less than 0.' }],
      })
    }

    const { nonce } = await request.validate({
      schema: schema.create({
        nonce: schema.number([
          rules.unique({
            table: 'blocks',
            column: 'nonce',
            where: {
              sender,
            },
          }),
        ]),
      }),
    })

    logger.info(`nonce: ${nonce}`)

    const hash = Block.hashBlock({ nonce, publicKey, sender, recipier, amount })

    logger.info(`block hash: ${hash}`)

    if (!verifySignature(publicKey, hash, signature)) {
      logger.warn('Signature verification failed.')

      return response.unprocessableEntity({
        errors: [{ message: 'Signature verification failed.' }],
      })
    }

    const prevBlock = await Block.getLastBlock()
    const block = await Block.create({
      timestamp: new Date().getTime(),
      nonce,
      publicKey,
      sender,
      recipier,
      amount,
      signature,
      hash,
      prevBlockHash: prevBlock?.hash || null,
    })

    logger.info(`Chain block index ${block.index}.`)

    return response.created(block)
  }
}
