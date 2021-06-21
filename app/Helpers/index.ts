import Block from 'App/Models/Block'

export const Address = {
  valid: (address: string) => {
    return /\b[A-Fa-f0-9]{64}\b/.test(address)
  },
  find: async (address: string) => {
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
