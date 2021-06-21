import crypto from 'crypto'
import Block from 'App/Models/Block'

export const Blockchain = {
  sha256: (data: string) => {
    return crypto.createHash('sha256').update(data).digest('hex')
  },
  getPublicKeyHash: (publicKey: string) => {
    const data = publicKey
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/[\n\r]/g, '')

    return Blockchain.sha256(data)
  },
  verifySignature: (publicKey: string, hash: string, signature: string) => {
    const verifier = crypto.createVerify('RSA-SHA256')
    verifier.write(hash)
    verifier.end()

    return verifier.verify(publicKey, signature, 'hex')
  },
  validAddress: (address: string) => {
    return /\b[A-Fa-f0-9]{64}\b/.test(address)
  },
  getAddress: async (address: string) => {
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

    const balance = totalReceived - totalSent

    return {
      transactions,
      totalReceived,
      totalSent,
      balance,
      blocks,
    }
  },
}
