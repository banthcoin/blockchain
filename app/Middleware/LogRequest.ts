import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle({ request }: HttpContextContract, next: () => Promise<void>) {
    console.log(`-> ${request.ip()} ${request.method()}: ${request.url()}`)
    await next()
  }
}
