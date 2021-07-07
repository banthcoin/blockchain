import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import Block from 'App/Models/Block'
import crypto, { getSignatureVerifyResult } from 'App/Utils/crypto'

interface NewBlock {
  publicKey: string
  nonce: number
  recipier: string
  value: number
  message?: string
  signature: string
}

class Blockchain {
  public async chain() {
    return await Block.all()
  }

  public async getBlock(index: number) {
    return await Block.find(index)
  }

  public async getBlockByHash(hash: string) {
    return await Block.findBy('hash', hash)
  }

  public async getLastBlock() {
    return await Block.query().orderBy('index', 'desc').first()
  }

  public async getAddressInfo(address: string) {
    const blocks = await Block.query().where({ sender: address }).orWhere({ recipier: address }).exec()

    const transactions = blocks.length

    const totalReceived = blocks
      .filter((block) => block.recipier === address)
      .map((block) => block.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const totalSent = blocks
      .filter((block) => block.sender === address)
      .map((block) => block.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const finalBalance = totalReceived - totalSent

    return {
      transactions,
      totalReceived,
      totalSent,
      finalBalance,
      blocks,
    }
  }

  public async addBlock(block: NewBlock) {
    const sender = crypto.hash(block.publicKey)
    const hash = crypto.hash(`${block.nonce}${sender}${block.recipier}${block.value}${block.message}`)

    // validar nonce
    await validator.validate({
      schema: schema.create({
        nonce: schema.number([
          rules.unique({
            table: 'blocks',
            column: 'nonce',
            where: { sender },
          }),
        ]),
      }),
      data: { nonce: block.nonce },
    })

    // validar recebedor
    await validator.validate({
      schema: schema.create({
        recipier: schema.string({ trim: true }, [rules.regex(/\b[A-Fa-f0-9]{64}\b/)]),
      }),
      data: { recipier: block.recipier },
    })

    // validar valor
    await validator.validate({
      schema: schema.create({
        value: schema.number([rules.range(1, 100000000000000000)]),
      }),
      data: { value: block.value },
    })

    // validar assinatura
    const signatureTestResult = getSignatureVerifyResult(block.publicKey, hash, block.signature)
    if (!signatureTestResult) throw new Error('Signature test failed!')

    // validar saldo
    const { finalBalance } = await this.getAddressInfo(sender)
    const balanceTestResult = finalBalance - block.value >= 0
    if (!balanceTestResult) throw new Error('Insufficient balance to transfer.')

    const prevBlock = await this.getLastBlock()
    const prevBlockHash = prevBlock?.hash

    return await Block.create({
      timestamp: new Date().getTime(),
      nonce: block.nonce,
      sender,
      recipier: block.recipier,
      value: block.value,
      message: block.message,
      publicKey: block.publicKey,
      signature: block.signature,
      hash,
      prevBlockHash,
    })
  }
}

export default new Blockchain()
