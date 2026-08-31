import { randomBytes } from 'node:crypto'

const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const requestedCount = Number.parseInt(process.argv[2] || '3', 10)
const baseUrl = process.argv[3] || 'https://macojaune.com/cho-kache'

if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > 100) {
  throw new Error('Le nombre de photos doit être compris entre 1 et 100.')
}

const createPart = (length) => {
  const bytes = randomBytes(length)
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}

const codes = Object.fromEntries(
  Array.from({ length: requestedCount }, (_, index) => [
    String(index + 1),
    `CHO-${createPart(4)}-${createPart(4)}`,
  ]),
)

console.log(`NUXT_CHO_KACHE_INTERNAL_CODES_JSON='${JSON.stringify(codes)}'`)
console.log('')

for (const [publicNumber, internalCode] of Object.entries(codes)) {
  const qrUrl = new URL(baseUrl)
  qrUrl.searchParams.set('code', internalCode)
  qrUrl.hash = 'signaler'
  console.log(`Photo n°${publicNumber}`)
  console.log(`Code au dos : ${internalCode}`)
  console.log(`QR : ${qrUrl.toString()}`)
  console.log('')
}
