import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import crypto from 'crypto'
import Block from 'App/Models/Block'

interface BlockContract {
  publicKey: string
  nonce: number
  recipier: string
  value: number
  message?: string
  signature: string
}

class Blockchain {
  private hash(data: string) {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  // private testSignature(publicKey: string, hash: string, signature: string) {
  //   const verifier = crypto.createVerify('RSA-SHA256')
  //   verifier.write(hash)
  //   verifier.end()

  //   return verifier.verify(publicKey, signature, 'hex')
  // }

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

  public async addBlock(block: BlockContract) {
    const { publicKey, nonce, recipier, value, message, signature } = block

    const publicKeyDer = publicKey.replace(/(-----(BEGIN|END) PUBLIC KEY-----|[\n\r])/g, '')
    const publicKeyDerHash = this.hash(publicKeyDer)
    const sender = publicKeyDerHash

    const hexRegex = /\b[A-Fa-f0-9]{64}\b/

    const minTransferValue = 1
    const limitTransferValue = 100000000000000000

    await validator.validate({
      schema: schema.create({
        nonce: schema.number([
          rules.unique({
            table: 'blocks',
            column: 'nonce',
            where: { sender },
          }),
        ]),
        recipier: schema.string({ trim: true }, [rules.regex(hexRegex)]),
        value: schema.number([rules.range(minTransferValue, limitTransferValue)]),
      }),
      data: { nonce, recipier, value },
    })

    const balanceTestResult = true // Add real test
    if (!balanceTestResult) throw new Error('Insufficient balance to transfer.')

    const hash = this.hash(`${nonce}${sender}${recipier}${value}${message}`)

    const signatureTestResult = true
    if (!signatureTestResult) throw new Error('Signature test failed!')

    const prevBlock = await this.getLastBlock()
    const prevBlockHash = prevBlock?.hash

    return await Block.create({
      timestamp: new Date().getTime(),
      publicKey,
      nonce,
      sender,
      recipier,
      value,
      message,
      signature,
      hash,
      prevBlockHash,
    })
  }
}

export default new Blockchain()
