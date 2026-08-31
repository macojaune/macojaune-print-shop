import { createHash, timingSafeEqual } from 'node:crypto'

import {
  createError,
  defineEventHandler,
  getHeader,
  getRequestIP,
  readMultipartFormData,
  setResponseStatus,
} from 'h3'

import { storeChoKacheDiscovery } from '../../utils/cho-kache-discoveries'

const allowedMediaTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
])
const maxFileSize = 25 * 1024 * 1024
const maxTotalSize = 50 * 1024 * 1024
const maxRequestSize = 52 * 1024 * 1024
const maxFiles = 3
const rateLimitWindow = 60 * 60 * 1000
const rateLimitMax = 6

const submissionAttempts = new Map<string, { count: number; resetAt: number }>()

const normalizeCode = (value: string) => value.trim().toUpperCase().replace(/\s+/g, '')
const hashCode = (value: string) => createHash('sha256').update(normalizeCode(value)).digest()

const codesMatch = (actual: string, expected: string) => timingSafeEqual(hashCode(actual), hashCode(expected))

const parseInternalCodes = (value: unknown) => {
  try {
    const parsed = typeof value === 'string'
      ? value.trim() ? JSON.parse(value) as unknown : null
      : value

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key, code]) => /^\d+$/.test(key) && typeof code === 'string' && code.trim()),
    ) as Record<string, string>
  } catch {
    return null
  }
}

const enforceRateLimit = (ip: string | undefined) => {
  if (!ip) {
    return
  }

  const now = Date.now()
  const current = submissionAttempts.get(ip)

  if (!current || current.resetAt <= now) {
    submissionAttempts.set(ip, { count: 1, resetAt: now + rateLimitWindow })
    return
  }

  if (current.count >= rateLimitMax) {
    throw createError({
      statusCode: 429,
      message: 'Trop de tentatives pour le moment. Réessaie un peu plus tard.',
    })
  }

  current.count += 1
}

const parseOptionalNumber = (value: string) => {
  if (!value) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

export default defineEventHandler(async (event) => {
  const contentLength = Number(getHeader(event, 'content-length') || 0)

  if (contentLength > maxRequestSize) {
    throw createError({
      statusCode: 413,
      message: 'Les fichiers dépassent 50 Mo au total.',
    })
  }

  enforceRateLimit(getRequestIP(event, { xForwardedFor: true }))

  const parts = await readMultipartFormData(event)

  if (!parts) {
    throw createError({
      statusCode: 400,
      message: "Le formulaire n'a pas été reçu correctement. Réessaie.",
    })
  }

  const getText = (name: string) => parts
    .find(part => part.name === name && !part.filename)
    ?.data.toString('utf8')
    .trim() || ''

  const publicNumber = Number.parseInt(getText('publicNumber'), 10)
  const internalCode = getText('internalCode')
  const contact = getText('contact').slice(0, 100)
  const locationNote = getText('locationNote').slice(0, 160)
  const allowSharing = getText('allowSharing') === 'true'
  const website = getText('website')

  if (website) {
    setResponseStatus(event, 201)
    return { publicNumber: Number.isInteger(publicNumber) ? publicNumber : 0, reference: 'RECU' }
  }

  if (!Number.isInteger(publicNumber) || publicNumber < 1 || publicNumber > 9999) {
    throw createError({
      statusCode: 400,
      message: 'Choisis le numéro indiqué sur la photo.',
    })
  }

  if (!internalCode || internalCode.length > 64) {
    throw createError({
      statusCode: 400,
      message: 'Ajoute le code imprimé au dos de la photo.',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const choKacheConfig = runtimeConfig.choKache || {}
  const internalCodes = parseInternalCodes(choKacheConfig.internalCodesJson)

  if (!internalCodes) {
    throw createError({
      statusCode: 503,
      message: "Le formulaire n'est pas encore branché. Réessaie plus tard.",
    })
  }

  const expectedCode = internalCodes[String(publicNumber)]

  if (!expectedCode || !codesMatch(internalCode, expectedCode)) {
    throw createError({
      statusCode: 400,
      message: 'Le numéro et le code ne correspondent pas. Vérifie le dos de la photo.',
    })
  }

  const media = parts
    .filter(part => part.name === 'media' && part.filename && part.data)
    .map(part => ({
      filename: part.filename || 'media',
      type: part.type || 'application/octet-stream',
      data: part.data,
    }))

  if (media.length > maxFiles) {
    throw createError({
      statusCode: 400,
      message: `Choisis ${maxFiles} fichiers maximum.`,
    })
  }

  const totalMediaSize = media.reduce((total, file) => total + file.data.length, 0)
  const invalidMedia = media.find(file => !allowedMediaTypes.has(file.type) || file.data.length > maxFileSize)

  if (invalidMedia) {
    throw createError({
      statusCode: 400,
      message: "Un fichier est trop lourd ou son format n'est pas accepté.",
    })
  }

  if (totalMediaSize > maxTotalSize) {
    throw createError({
      statusCode: 413,
      message: 'Les fichiers dépassent 50 Mo au total.',
    })
  }

  const latitude = parseOptionalNumber(getText('latitude'))
  const longitude = parseOptionalNumber(getText('longitude'))
  const accuracy = parseOptionalNumber(getText('accuracy'))
  const hasAnyCoordinate = latitude !== null || longitude !== null || accuracy !== null
  const hasValidCoordinates = latitude !== null
    && longitude !== null
    && accuracy !== null
    && Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && Number.isFinite(accuracy)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180
    && accuracy >= 0
    && accuracy <= 100000
  const coordinates = hasValidCoordinates
    ? {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: Number(accuracy),
      }
    : null

  if (hasAnyCoordinate && !hasValidCoordinates) {
    throw createError({
      statusCode: 400,
      message: "La position n'a pas été reçue correctement. Retire-la ou réessaie.",
    })
  }

  const r2Config = runtimeConfig.r2 || {}
  const r2AccountId = String(r2Config.accountId || '')
  const r2AccessKeyId = String(r2Config.accessKeyId || '')
  const r2SecretAccessKey = String(r2Config.secretAccessKey || '')
  const r2Bucket = String(r2Config.bucket || '')

  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2Bucket) {
    throw createError({
      statusCode: 503,
      message: "L'envoi n'est pas encore disponible. Réessaie plus tard.",
    })
  }

  try {
    const result = await storeChoKacheDiscovery(
      {
        accountId: r2AccountId,
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
        bucket: r2Bucket,
        prefix: String(choKacheConfig.r2Prefix || 'private/cho-kache/discoveries'),
      },
      {
        publicNumber,
        contact,
        locationNote,
        coordinates,
        allowSharing,
        media,
        submittedAt: new Date().toISOString(),
      },
    )

    setResponseStatus(event, 201)

    return {
      publicNumber,
      reference: result.reference,
    }
  } catch (error) {
    console.error('Unable to store Cho Kache discovery.', error)

    throw createError({
      statusCode: 503,
      message: "L'envoi n'est pas passé. Tes fichiers n'ont pas été publiés. Réessaie plus tard.",
    })
  }
})
