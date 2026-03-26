import { createHash, randomBytes } from "node:crypto"
import path from "node:path"

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import sharp from "sharp"

import { RUN_MEDIA_PREFIX } from "../../utils/run-media"

type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  mediaBaseUrl: string
  mastersPrefix: string
  publicPrefix: string
  manifestPrefix: string
}

type VariantFormat = "avif" | "webp"
type VariantName = "thumb" | "card" | "detail" | "social"

type VariantEntry = Record<
  VariantFormat,
  {
    src: string
    width: number
    height: number
  }[]
>

type AssetManifest = {
  id: string
  assetId: string
  src: string
  filename: string
  previewSrc: string
  masterKey: string
  thumb: VariantEntry
  card: VariantEntry
  detail: VariantEntry
  social: VariantEntry
}

type UploadedFile = {
  filename: string
  type?: string
  data: Buffer
}

const watermarkLabel = "macojaune.com"

const variantPresets: Record<
  VariantName,
  { widths: number[]; watermark: boolean; quality: Record<VariantFormat, number> }
> = {
  thumb: { widths: [320, 640], watermark: true, quality: { avif: 46, webp: 62 } },
  card: { widths: [480, 768, 1080], watermark: true, quality: { avif: 48, webp: 64 } },
  detail: { widths: [768, 1280, 1680], watermark: true, quality: { avif: 50, webp: 68 } },
  social: { widths: [1200], watermark: true, quality: { avif: 52, webp: 72 } },
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

function getTargetWidths(sourceWidth: number, widths: number[]) {
  const candidates = widths.filter((width) => width < sourceWidth)

  if (candidates.length === 0 || candidates[candidates.length - 1] !== sourceWidth) {
    candidates.push(sourceWidth)
  }

  return [...new Set(candidates)]
}

function createWatermarkOverlay(width: number, height: number) {
  const tileWidth = Math.max(220, Math.round(width * 0.26))
  const tileHeight = Math.max(140, Math.round(height * 0.18))
  const fontSize = Math.max(18, Math.round(width * 0.028))

  return Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="wm" width="${tileWidth}" height="${tileHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
          <text x="0" y="${Math.round(tileHeight * 0.6)}" fill="rgba(245, 158, 11, 0.18)" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" letter-spacing="2">${watermarkLabel}</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wm)"/>
    </svg>`,
  )
}

function getR2Config() {
  const config = useRuntimeConfig()
  const privateConfig = config.r2 || {}
  const publicConfig = config.public || {}

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
        "R2 image pipeline is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, and NUXT_PUBLIC_MEDIA_BASE_URL.",
    })
  }

  const resolvedConfig: R2Config = {
    accountId: String(privateConfig.accountId || process.env.R2_ACCOUNT_ID),
    accessKeyId: String(privateConfig.accessKeyId || process.env.R2_ACCESS_KEY_ID),
    secretAccessKey: String(privateConfig.secretAccessKey || process.env.R2_SECRET_ACCESS_KEY),
    bucket: String(privateConfig.bucket || process.env.R2_BUCKET || process.env.R2_BUCKET_NAME),
    mediaBaseUrl: mediaBaseUrl.startsWith("http") ? mediaBaseUrl : `https://${mediaBaseUrl}`,
    mastersPrefix: trimSlashes(String(privateConfig.mastersPrefix || "masters/runs")),
    publicPrefix: trimSlashes(String(privateConfig.publicPrefix || "pictures/runs")),
    manifestPrefix: trimSlashes(String(privateConfig.manifestPrefix || "manifests/runs")),
  }

  return resolvedConfig
}

function getS3Client(config: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

function buildPublicUrl(config: R2Config, key: string) {
  return `${config.mediaBaseUrl}/${trimSlashes(key)}`
}

function getCanonicalSrc(assetId: string) {
  return `${RUN_MEDIA_PREFIX}${trimSlashes(assetId)}`
}

function getManifestKey(config: R2Config, assetId: string) {
  return `${config.manifestPrefix}/${trimSlashes(assetId)}.json`
}

function getPublicAssetPrefix(config: R2Config, assetId: string) {
  return `${config.publicPrefix}/${trimSlashes(assetId)}`
}

async function putObject(
  client: S3Client,
  config: R2Config,
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
    }),
  )
}

async function getObjectText(client: S3Client, config: R2Config, key: string) {
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

async function listAllKeys(client: S3Client, config: R2Config, prefix: string) {
  const keys: string[] = []
  let continuationToken: string | undefined

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    )

    for (const item of response.Contents || []) {
      if (item.Key) {
        keys.push(item.Key)
      }
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken)

  return keys
}

function getDirectoryPrefix(directory: string | undefined) {
  const normalized = sanitizeSegment(directory || "")
  return normalized
}

function makeAssetId(filename: string, directory: string | undefined, data: Buffer) {
  const basename = sanitizeSegment(path.parse(filename).name) || "image"
  const directoryPrefix = getDirectoryPrefix(directory)
  const hash = createHash("sha1").update(data).digest("hex").slice(0, 10)
  const randomSuffix = randomBytes(2).toString("hex")
  const leaf = `${basename}-${hash}-${randomSuffix}`

  return [directoryPrefix, leaf].filter(Boolean).join("/")
}

function pickPreviewSrc(manifest: AssetManifest) {
  return (
    manifest.card.webp[manifest.card.webp.length - 1]?.src ||
    manifest.detail.webp[manifest.detail.webp.length - 1]?.src ||
    manifest.social.webp[manifest.social.webp.length - 1]?.src ||
    manifest.src
  )
}

export async function createR2ImageAsset(file: UploadedFile, directory?: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const assetId = makeAssetId(file.filename, directory, file.data)
  const extension = (path.extname(file.filename) || ".jpg").toLowerCase()
  const masterKey = `${config.mastersPrefix}/${assetId}/master${extension}`

  const metadata = await sharp(file.data).rotate().metadata()

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

  const manifest: AssetManifest = {
    id: assetId,
    assetId,
    src: getCanonicalSrc(assetId),
    filename: file.filename,
    previewSrc: "",
    masterKey,
    thumb: { avif: [], webp: [] },
    card: { avif: [], webp: [] },
    detail: { avif: [], webp: [] },
    social: { avif: [], webp: [] },
  }

  for (const [variantName, preset] of Object.entries(variantPresets) as [
    VariantName,
    (typeof variantPresets)[VariantName],
  ][]) {
    const widths = getTargetWidths(metadata.width, preset.widths)
    const publicPrefix = getPublicAssetPrefix(config, assetId)

    for (const format of ["avif", "webp"] as VariantFormat[]) {
      for (const width of widths) {
        const resizedImage = await sharp(file.data)
          .rotate()
          .resize({
            width,
            withoutEnlargement: true,
            fit: "inside",
          })
          .toBuffer({ resolveWithObject: true })

        let pipeline = sharp(resizedImage.data)

        if (preset.watermark) {
          pipeline = pipeline.composite([
            {
              input: createWatermarkOverlay(resizedImage.info.width, resizedImage.info.height),
              gravity: "center",
            },
          ])
        }

        const transformed = await pipeline[format]({ quality: preset.quality[format] }).toBuffer()
        const derivativeKey = `${publicPrefix}/${variantName}-${width}.${format}`

        await putObject(
          client,
          config,
          derivativeKey,
          transformed,
          format === "avif" ? "image/avif" : "image/webp",
        )

        manifest[variantName][format].push({
          src: buildPublicUrl(config, derivativeKey),
          width: resizedImage.info.width,
          height: resizedImage.info.height,
        })
      }
    }
  }

  manifest.previewSrc = pickPreviewSrc(manifest)

  await putObject(
    client,
    config,
    getManifestKey(config, assetId),
    JSON.stringify(manifest, null, 2),
    "application/json",
  )

  return manifest
}

export async function listR2Images(limit = 50, offset?: string, directory?: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: config.manifestPrefix,
      ContinuationToken: offset,
      MaxKeys: limit,
    }),
  )

  const items = await Promise.all(
    (response.Contents || [])
      .filter((item) => item.Key?.endsWith(".json"))
      .map(async (item) => {
        const body = await getObjectText(client, config, item.Key as string)
        const manifest = JSON.parse(body) as AssetManifest
        const assetDirectory =
          path.posix.dirname(manifest.assetId) === "." ? "" : path.posix.dirname(manifest.assetId)

        if (directory && assetDirectory !== directory.replace(/^\/+|\/+$/g, "")) {
          return null
        }

        return {
          id: manifest.assetId,
          type: "file" as const,
          filename: manifest.filename,
          directory: assetDirectory,
          src: manifest.src,
          thumbnails: {
            "75x75": manifest.thumb.webp[0]?.src || manifest.previewSrc,
            "400x400": manifest.card.webp[0]?.src || manifest.previewSrc,
            "1000x1000": manifest.previewSrc,
          },
        }
      }),
  )

  return {
    items: items.filter(Boolean),
    nextOffset: response.IsTruncated ? response.NextContinuationToken : undefined,
  }
}

export async function deleteR2ImageAsset(assetId: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const prefixes = [
    `${config.mastersPrefix}/${trimSlashes(assetId)}/`,
    `${config.publicPrefix}/${trimSlashes(assetId)}/`,
  ]

  for (const prefix of prefixes) {
    const keys = await listAllKeys(client, config, prefix)

    if (keys.length > 0) {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: config.bucket,
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        }),
      )
    }
  }

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: getManifestKey(config, assetId),
    }),
  )
}

export async function getR2ImageManifest(assetId: string) {
  const config = getR2Config()
  const client = getS3Client(config)
  const body = await getObjectText(client, config, getManifestKey(config, assetId))
  return JSON.parse(body) as AssetManifest
}
