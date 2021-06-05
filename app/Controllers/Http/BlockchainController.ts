import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Blockchain from 'App/Blockchain'
import Block from 'App/Models/Block'
import Miner from 'App/Models/Miner'
import { isHash } from 'App/Utils/crypto'

export default class BlockchainController {
  public async sync({ response }: HttpContextContract) {
    const blocks = await Block.all()
    const miners = await Miner.all()
    return response.ok({ blocks, miners })
  }

  public async chain({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const chain = await blockchain.chain()
    return response.ok({ chain })
  }

  public async paginate({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const chain = await blockchain.paginate(100)
    return response.ok({ chain })
  }

  public async hashs({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const hashs = await blockchain.getBlocksHash()

    if (params.token) {
      return response.ok({
        hashs,
      })
    } else {
      return response.ok({
        hashs,
        d: blockchain.difficulty,
        r: blockchain.miningReward,
      })
    }
  }

  public async miner({ params, request, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        miner: schema.string(),
        block: schema.string(),
        rnd: schema.string(),
      }),
    })

    if (!isHash(data.miner)) {
      return response.badRequest('Miner is not valid address.')
    }

    const blockchain = new Blockchain(params.token)
    return await blockchain.mining(data.block, data.rnd, data.miner)
  }

  public async setupToken({ params, request, response }: HttpContextContract) {
    const data = await request.validate({
      schema: schema.create({
        recipier: schema.string(),
        value: schema.number(),
      }),
    })

    const blockchain = new Blockchain(params.token)
    const block = await blockchain.setupToken(data)

    return response.ok(block)
  }

  public async tokenSupply({ params, response }: HttpContextContract) {
    const blockchain = new Blockchain(params.token)
    const data = await blockchain.getTokenSupply()

    return response.ok(data)
  }
}
