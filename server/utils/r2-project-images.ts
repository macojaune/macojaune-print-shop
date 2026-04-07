import { createHash } from "node:crypto"
import path from "node:path"

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { createError } from "h3"
import sharp from "sharp"

import { PROJECT_MEDIA_PREFIX } from "../../app/utils/project-media"

type ProjectR2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  mediaBaseUrl: string
  mastersPrefix: string
  publicPrefix: string
  manifestPrefix: string
}

type UploadedFile = {
  filename: string
  type?: string
  data: Buffer
}

export type ProjectAssetManifest = {
  id: string
  assetId: string
  src: string
  filename: string
  previewSrc: string
  masterKey: string
  preview: {
    src: string
    width: number
    height: number
  }
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "")
}

function sanitizeSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s/-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    .toLowerCase()
}

function normalizeAssetId(assetId: string) {
  return assetId
    .split("/")
    .map((segment) => sanitizeSegment(segment))
    .filter(Boolean)
    .join("/")
}

function createSharpInput(input: Buffer) {
  return sharp(input, { failOn: "none" }).rotate()
}

function getR2Config() {
  const runtimeConfig = typeof globalThis.useRuntimeConfig === "function"
    ? globalThis.useRuntimeConfig()
    : { r2: {}, public: {} }
  const privateConfig = runtimeConfig.r2 || {}
  const publicConfig = runtimeConfig.public || {}

  const mediaBaseUrl = trimSlashes(
    String(
      publicConfig.mediaBaseUrl ||
      publicConfig.assetBaseUrl ||
      process.env.NUXT_PUBLIC_MEDIA_BASE_URL ||
      process.env.R2_PUBLIC_BASE_URL ||
      "",
    ),
  )

  if (
    !(privateConfig.accountId || process.env.R2_ACCOUNT_ID) ||
    !(privateConfig.accessKeyId || process.env.R2_ACCESS_KEY_ID) ||
    !(privateConfig.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY) ||
    !(privateConfig.bucket || process.env.R2_BUCKET || process.env.R2_BUCKET_NAME) ||
    !mediaBaseUrl
  ) {
    throw createError({
      statusCode: 500,
      statusMessage:
        "Project R2 image pipeline is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and NUXT_PUBLIC_MEDIA_BASE_URL.",
    })
  }

  return {
    accountId: String(privateConfig.accountId || process.env.R2_ACCOUNT_ID),
    accessKeyId: String(privateConfig.accessKeyId || process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: String(privateConfig.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY),
    bucket: String(privateConfig.bucket || process.env.R2_BUCKET || process.env.R2_BUCKET_NAME),
    mediaBaseUrl: mediaBaseUrl.startsWith("http") ? mediaBaseUrl : `https://${mediaBaseUrl}`,
    mastersPrefix: "masters/projects",
    publicPrefix: "pictures/projects",
    manifestPrefix: "manifests/projects",
  } as ProjectR2Config
}

function getS3Client(config: ProjectR2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

function buildPublicUrl(config: ProjectR2Config, key: string) {
  return `${config.mediaBaseUrl}/${trimSlashes(key)}`
}

function getCanonicalSrc(assetId: string) {
  return `${PROJECT_MEDIA_PREFIX}${trimSlashes(assetId)}`
}

function getManifestKey(config: ProjectR2Config, assetId: string) {
  return `${config.manifestPrefix}/${trimSlashes(assetId)}.json`
}

async function putObject(
  client: S3Client,
  config: ProjectR2Config,
  key: string,
  body: Buffer | string,
  contentType: string,
) {
  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )
}

async function getObjectText(client: S3Client, config: ProjectR2Config, key: string) {
  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  )

  if (!response.Body) {
    throw new Error(`Empty response body for ${key}`)
  }

  if ("transformToString" in response.Body) {
    return response.Body.transformToString()
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString("utf8")
}

export async function createR2ProjectImageAsset(file: UploadedFile, explicitAssetId?: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const hash = createHash("sha1").update(file.data).digest("hex").slice(0, 10)
  const baseName = sanitizeSegment(path.parse(file.filename).name) || "image"
  const assetId = normalizeAssetId(explicitAssetId || `${baseName}-${hash}`)
  const extension = (path.extname(file.filename) || ".jpg").toLowerCase()
  const masterKey = `${config.mastersPrefix}/${assetId}/master${extension}`

  const metadata = await createSharpInput(file.data).metadata()

  if (!metadata.width || !metadata.height) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unable to read dimensions for ${file.filename}.`,
    })
  }

  await putObject(
    client,
    config,
    masterKey,
    file.data,
    file.type || "application/octet-stream",
  )

  const resized = await createSharpInput(file.data)
    .resize({
      width: Math.min(metadata.width, 1280),
      withoutEnlargement: true,
      fit: "inside",
    })
    .webp({ quality: 74 })
    .toBuffer({ resolveWithObject: true })

  const previewKey = `${config.publicPrefix}/${assetId}/preview-${resized.info.width}.webp`
  const previewSrc = buildPublicUrl(config, previewKey)

  await putObject(
    client,
    config,
    previewKey,
    resized.data,
    "image/webp",
  )

  const manifest: ProjectAssetManifest = {
    id: assetId,
    assetId,
    src: getCanonicalSrc(assetId),
    filename: file.filename,
    previewSrc,
    masterKey,
    preview: {
      src: previewSrc,
      width: resized.info.width,
      height: resized.info.height,
    },
  }

  await putObject(
    client,
    config,
    getManifestKey(config, assetId),
    JSON.stringify(manifest, null, 2),
    "application/json",
  )

  return manifest
}

export async function getR2ProjectImageManifest(assetId: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const body = await getObjectText(client, config, getManifestKey(config, assetId))
  return JSON.parse(body) as ProjectAssetManifest
}
