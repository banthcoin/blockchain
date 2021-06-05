import crypto from 'crypto'

export function hash(data: string) {
  return crypto.createHash('sha256').update(data).digest('hex')
}
export function isHash(str: string) {
  const regexExp = /^[a-f0-9]{64}$/gi
  return regexExp.test(str)
}

export function getSignature(privateKey: string, data: string) {
  const signer = crypto.createSign('RSA-SHA256')
  signer.write(data)
  signer.end()

  const buff = Buffer.from(privateKey, 'base64')

  return signer.sign({ key: buff, format: 'der', type: 'pkcs8' }, 'hex')
}

export function getSignatureVerifyResult(publicKey: string, hash: string, signature: string) {
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.update(hash)

  const buff = Buffer.from(publicKey, 'base64')

  return verifier.verify({ key: buff, format: 'der', type: 'spki' }, signature, 'hex')
}

export function generateKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  })
}

export default {
  hash,
  getSignature,
  getSignatureVerifyResult,
  generateKeyPair,
}
