import fetch from 'node-fetch'
import cache from 'memory-cache'
import { validator, schema, rules } from '@ioc:Adonis/Core/Validator'
import Block from 'App/Models/Block'
import BlockConfirmation from 'App/Models/BlockConfirmation'
import Miner from 'App/Models/Miner'
import crypto, { getSignatureVerifyResult } from 'App/Utils/crypto'

interface NewBlock {
  publicKey: string
  nonce: number
  recipier: string
  value: number
  message?: string
  signature: string
}

interface SetupTokenBlock {
  recipier: string
  value: number
}

class Blockchain {
  public difficulty: number = 6
  public miningReward: number = 0.00001

  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  public async chain() {
    const query = Block.query()

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    return await query.exec()
  }

  public async paginate(limit: number = 100) {
    const query = Block.query().orderBy('index', 'desc').limit(limit)

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    return await query.exec()
  }

  public async getBlock(index: number) {
    const query = Block.query().where('index', index)

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    const block = await query.withCount('confirmations').firstOrFail()
    return { ...block.serialize(), $extras: block.$extras }
  }

  public async getBlockByHash(hash: string) {
    const query = Block.query().where('hash', hash)

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    const block = await query.withCount('confirmations').firstOrFail()
    return { ...block.serialize(), $extras: block.$extras }
  }

  public async getLastBlock() {
    const query = Block.query().orderBy('index', 'desc')

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    return await query.first()
  }

  public async getBlocksHash() {
    const query = Block.query().select('hash')

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    const blocks = await query.exec()
    const hashs = blocks.map((block) => block.hash)

    return hashs
  }

  public async getBlocksByAddress(address: string) {
    const query = Block.query().where((query) => {
      query.where({ sender: address }).orWhere({ recipier: address })
    })

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    return await query.exec()
  }

  public async getMiner(address: string) {
    if (this.token) {
      return await Miner.firstOrCreate({ address, token: this.token })
    } else {
      return await Miner.firstOrCreate({ address })
    }
  }

  public async addMinerReward(address: string, reward: number) {
    const miner = await this.getMiner(address)

    const totalRewards = (miner.totalRewards || 0) + reward
    await miner.merge({ totalRewards }).save()
  }

  public async getAddress(address: string) {
    const blocks = await this.getBlocksByAddress(address)
    const miner = await this.getMiner(address)

    const transactions = blocks.length

    const totalReceived = blocks
      .filter((block) => block.recipier === address)
      .map((block) => block.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const totalSent = blocks
      .filter((block) => block.sender === address)
      .map((block) => block.value)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)

    const miningRewards = miner.totalRewards || 0
    const finalBalance = totalReceived - totalSent + miningRewards

    return {
      transactions,
      miningRewards,
      totalReceived,
      totalSent,
      finalBalance,
      balance: finalBalance,
      blocks,
    }
  }

  public async addBlock(block: NewBlock) {
    const sender = crypto.hash(block.publicKey)
    const hash = crypto.hash(`${block.nonce}${sender}${block.recipier}${block.value}${block.message}`)

    console.log(`raw=${block.nonce}${sender}${block.recipier}${block.value}${block.message}`)
    console.log(`hash=${hash}`)

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

    const value = parseFloat(block.value.toFixed(8))

    // validar valor
    await validator.validate({
      schema: schema.create({
        value: schema.number([rules.range(0.00000001, 1000000000)]),
      }),
      data: { value },
    })

    // validar assinatura
    const signatureTestResult = getSignatureVerifyResult(block.publicKey, hash, block.signature)

    console.log(`publicKey: ${block.publicKey}`)
    console.log(`signature: ${block.signature}`)
    console.log(`signature result: ${signatureTestResult}`)

    if (!signatureTestResult) throw new Error('Signature test failed!')

    // validar saldo
    const { finalBalance } = await this.getAddress(sender)
    const balanceTestResult = finalBalance - value >= 0
    if (!balanceTestResult) throw new Error('Insufficient balance to transfer.')

    const prevBlock = await this.getLastBlock()
    const prevBlockHash = prevBlock?.hash

    return await Block.create({
      token: this.token,
      timestamp: new Date().getTime(),
      nonce: block.nonce,
      sender,
      recipier: block.recipier,
      value,
      message: block.message,
      publicKey: block.publicKey,
      signature: block.signature,
      hash,
      prevBlockHash,
    })
  }

  public async mining(hash: string, rnd: string, miner: string) {
    const confirmation = await BlockConfirmation.query()
      .where({
        block: hash,
        rnd,
      })
      .first()

    if (confirmation) {
      throw new Error('Double confirmation')
    }

    const block = await Block.query()
      .where('hash', hash)
      .if(this.token, (query) => {
        query.where('token', this.token!)
      })
      .firstOrFail()

    if (block.token !== this.token) {
      throw new Error('Bad confirmation token')
    }

    let difficulty = this.difficulty
    let miningReward = this.miningReward
    let adminReward = null
    let adminAddress = null

    if (this.token) {
      try {
        const minerSettings = await this.getTokenMinerSettings()

        difficulty = minerSettings.difficulty
        miningReward = minerSettings.mining_reward
        adminReward = minerSettings.admin_reward
        adminAddress = minerSettings.admin_address
      } catch (error) {
        throw error
      }
    }

    const difficultySubHash = '0'.repeat(difficulty)
    const confirmationHash = crypto.hash(hash + rnd)

    if (confirmationHash.substring(0, difficulty) === difficultySubHash) {
      await block.related('confirmations').create({
        uniq: `${hash}${rnd}`,
        block: hash,
        rnd,
        miner,
        difficulty: difficulty,
        reward: miningReward,
      })

      await this.addMinerReward(miner, miningReward)

      if (adminReward && adminAddress) {
        await this.addMinerReward(adminAddress, adminReward)
      }
    } else {
      throw new Error('Bad confirmation')
    }
  }

  public async setupToken(block: SetupTokenBlock) {
    if (!this.token) {
      throw new Error('Bad Request')
    }

    const blocks = await Block.query().where('token', this.token).exec()

    if (blocks.length !== 0) {
      throw new Error('Bad Request')
    }

    // validar recebedor
    await validator.validate({
      schema: schema.create({
        recipier: schema.string({ trim: true }, [rules.regex(/\b[A-Fa-f0-9]{64}\b/)]),
      }),
      data: { recipier: block.recipier },
    })

    const value = parseFloat(block.value.toFixed(8))

    // validar valor
    await validator.validate({
      schema: schema.create({
        value: schema.number([rules.range(0.00000001, 1000000000)]),
      }),
      data: { value },
    })

    return await Block.create({
      token: this.token,
      timestamp: new Date().getTime(),
      nonce: new Date().getTime(),
      sender: 'first_block',
      recipier: block.recipier,
      value,
      message: 'first_block',
      publicKey: 'first_block',
      signature: 'first_block',
      hash: 'first_block',
      prevBlockHash: 'first_block',
    })
  }

  public async getTokenSupply() {
    if (!this.token) {
      throw new Error('Bad Request')
    }

    let supply = 0
    let mined = 0

    const firstBlock = await Block.query().where('token', this.token).where('sender', 'first_block').first()

    if (firstBlock) {
      supply += firstBlock.value
    }

    const burnAddress = '0000000000000000000000000000000000000000000000000000000000000000'
    const burnedBlocks = await Block.query().where('token', this.token).where('recipier', burnAddress).exec()

    for (const block of burnedBlocks) {
      supply -= block.value
    }

    const miners = await Miner.query().where('token', this.token).exec()

    for (const miner of miners) {
      mined += miner.totalRewards
      supply += miner.totalRewards
    }

    return { supply, mined }
  }

  public async getTotalMined() {
    const query = Miner.query()

    if (this.token) {
      query.where('token', this.token)
    } else {
      query.whereNull('token')
    }

    const miners = await query.exec()

    let totalMined = 0

    for (const miner of miners) {
      totalMined += miner.totalRewards
    }

    return totalMined
  }

  public async getTokenMinerSettings() {
    const settings = cache.get(this.token)

    if (!settings) {
      console.log(`updating token ${this.token} settings`)

      const isProduction = process.env.NODE_ENV === 'production'
      const baseUrl = isProduction ? 'https://api.minhatoken.com' : 'http://localhost:3333'

      const totalMined = await this.getTotalMined()

      const request = await fetch(`${baseUrl}/tokens/${this.token}/miner/settings?total_mined=${totalMined}`)
      const settings = await request.json()

      cache.put(this.token, settings, 10 * 1000)

      return settings
    } else {
      return settings
    }
  }
}

export default Blockchain
