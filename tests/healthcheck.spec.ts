import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://0.0.0.0:${process.env.PORT}`

test.group('Health check', () => {
  test('Health check report', async () => {
    await supertest(BASE_URL).get('/health').expect(200)
  })
})
