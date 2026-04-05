#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const cwd = process.cwd()
const localDir = path.resolve(cwd, process.env.R2_LOCAL_DIR || "public/pictures")
const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME
const prefix = (process.env.R2_PREFIX || "pictures").replace(/^\/+|\/+$/g, "")
const accountId = process.env.R2_ACCOUNT_ID
const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "")
const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY

const requiredValues = {
  R2_BUCKET: bucket,
  R2_ENDPOINT: endpoint,
}

const missingValues = Object.entries(requiredValues)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingValues.length > 0) {
  console.error(`Missing required environment variables: ${missingValues.join(", ")}`)
  process.exit(1)
}

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".json", "application/json"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
])

const client = new S3Client({
  credentials: accessKeyId && secretAccessKey
    ? {
        accessKeyId,
        secretAccessKey,
      }
    : undefined,
  endpoint,
  region: "auto",
})

const collectFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith("."))
      .map(async (entry) => {
        const resolvedPath = path.join(directory, entry.name)
        return entry.isDirectory() ? collectFiles(resolvedPath) : resolvedPath
      }),
  )

  return files.flat()
}

const uploadFile = async (filePath) => {
  const relativePath = path.relative(localDir, filePath).split(path.sep).join("/")
  const key = prefix ? `${prefix}/${relativePath}` : relativePath
  const body = await readFile(filePath)
  const extension = path.extname(filePath).toLowerCase()
  const contentType = contentTypes.get(extension) || "application/octet-stream"

  await client.send(new PutObjectCommand({
    Body: body,
    Bucket: bucket,
    CacheControl: "public, max-age=31536000, immutable",
    ContentType: contentType,
    Key: key,
  }))

  console.log(`uploaded ${key}`)
}

const run = async () => {
  const files = await collectFiles(localDir)
  const batchSize = 8

  console.log(`Uploading ${files.length} files from ${localDir} to s3://${bucket}/${prefix}`)

  for (let index = 0; index < files.length; index += batchSize) {
    await Promise.all(files.slice(index, index + batchSize).map(uploadFile))
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
