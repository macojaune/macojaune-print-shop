import { randomUUID } from 'node:crypto'

import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export type ChoKacheDiscoveryMedia = {
  filename: string
  type: string
  data: Buffer
}

export type ChoKacheDiscoveryPayload = {
  publicNumber: number
  contact: string
  coordinates: {
    latitude: number
    longitude: number
    accuracy: number
  } | null
  allowSharing: boolean
  media: ChoKacheDiscoveryMedia[]
  submittedAt: string
}

type ChoKacheR2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  prefix: string
}

const mediaExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
}

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')

const createR2Client = (config: ChoKacheR2Config) => new S3Client({
  region: 'auto',
  endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
})

export async function storeChoKacheDiscovery(
  config: ChoKacheR2Config,
  payload: ChoKacheDiscoveryPayload,
) {
  const client = createR2Client(config)
  const discoveryId = randomUUID()
  const date = new Date(payload.submittedAt)
  const datePath = [
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
  ].join('/')
  const discoveryPrefix = [trimSlashes(config.prefix), datePath, discoveryId].filter(Boolean).join('/')
  const uploadedKeys: string[] = []

  try {
    const storedMedia = []

    for (const [index, file] of payload.media.entries()) {
      const extension = mediaExtensions[file.type] || 'bin'
      const key = `${discoveryPrefix}/media/${String(index + 1).padStart(2, '0')}.${extension}`

      await client.send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: file.data,
        ContentType: file.type,
        ContentLength: file.data.length,
        ContentDisposition: 'attachment',
        CacheControl: 'private, no-store',
      }))

      uploadedKeys.push(key)
      storedMedia.push({
        key,
        originalFilename: file.filename.slice(0, 180),
        type: file.type,
        size: file.data.length,
      })
    }

    const manifestKey = `${discoveryPrefix}/submission.json`
    const manifest = {
      id: discoveryId,
      publicNumber: payload.publicNumber,
      contact: payload.contact,
      coordinates: payload.coordinates,
      allowSharing: payload.allowSharing,
      media: storedMedia,
      submittedAt: payload.submittedAt,
    }

    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: manifestKey,
      Body: JSON.stringify(manifest, null, 2),
      ContentType: 'application/json; charset=utf-8',
      CacheControl: 'private, no-store',
    }))

    uploadedKeys.push(manifestKey)

    return {
      id: discoveryId,
      reference: discoveryId.split('-')[0]?.toUpperCase() || discoveryId.slice(0, 8).toUpperCase(),
    }
  } catch (error) {
    if (uploadedKeys.length) {
      await client.send(new DeleteObjectsCommand({
        Bucket: config.bucket,
        Delete: {
          Objects: uploadedKeys.map(Key => ({ Key })),
          Quiet: true,
        },
      })).catch(() => undefined)
    }

    throw error
  }
}
