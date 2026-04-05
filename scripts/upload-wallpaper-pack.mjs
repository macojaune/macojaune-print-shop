#!/usr/bin/env node

import { createHash } from "node:crypto"
import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import matter from "gray-matter"
import YAML from "yaml"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const runsDir = path.join(repoRoot, "content", "runs")

loadEnvFile(path.join(repoRoot, ".env"))

function loadEnvFile(targetPath) {
  if (!existsSync(targetPath)) {
    return
  }

  const lines = readFileSync(targetPath, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    if (!key || process.env[key] !== undefined) {
      continue
    }

    let value = trimmed.slice(separatorIndex + 1).trim()

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    } else {
      value = value.replace(/\s+#.*$/, "")
    }

    process.env[key] = value
  }
}

function usage(message) {
  if (message) {
    console.error(`Error: ${message}\n`)
  }

  console.error(`Usage:
  node scripts/upload-wallpaper-pack.mjs --slug <run-slug> --file <path/to/file.zip> [--dry-run]

Options:
  --slug <value>      Existing run slug to update in content/runs.
  --file <path>       ZIP file to upload to R2.
  --dry-run           Print the planned upload and markdown change without writing anything.
`)

  process.exit(message ? 1 : 0)
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    file: "",
    slug: "",
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--slug") {
      args.slug = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--file") {
      args.file = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--dry-run") {
      args.dryRun = true
      continue
    }

    if (arg === "--help" || arg === "-h") {
      usage()
    }

    usage(`Unknown argument "${arg}"`)
  }

  if (!args.slug) {
    usage("Missing required --slug")
  }

  if (!args.file) {
    usage("Missing required --file")
  }

  return args
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sanitizeFilename(value = "") {
  const parsed = path.parse(value)
  const base = slugify(parsed.name) || "wallpaper-pack"
  return `${base}${parsed.ext.toLowerCase()}`
}

function stringifyFrontmatter(data) {
  const doc = new YAML.Document()
  doc.contents = data
  return doc.toString({ lineWidth: 0 }).trimEnd()
}

function setWallpaperPackUrl(data, wallpaperPackUrl) {
  const nextData = { ...data, wallpaperPackUrl }

  if (!("title" in nextData) && !("description" in nextData)) {
    return nextData
  }

  const {
    title,
    description,
    wallpaperPackUrl: nextWallpaperPackUrl,
    ...rest
  } = nextData

  const orderedData = {}

  if (title !== undefined) {
    orderedData.title = title
  }

  if (description !== undefined) {
    orderedData.description = description
  }

  orderedData.wallpaperPackUrl = nextWallpaperPackUrl

  return {
    ...orderedData,
    ...rest,
  }
}

async function findRunFileBySlug(slug) {
  const entries = await fs.readdir(runsDir)
  const matchingFiles = []

  for (const entry of entries) {
    if (!entry.endsWith(".md")) {
      continue
    }

    const absolutePath = path.join(runsDir, entry)
    const source = await fs.readFile(absolutePath, "utf8")
    const parsed = matter(source)

    if (slugify(String(parsed.data.slug || "")) === slug) {
      matchingFiles.push({ absolutePath, parsed })
    }
  }

  if (matchingFiles.length === 0) {
    throw new Error(`Could not find a run with slug "${slug}" in content/runs`)
  }

  if (matchingFiles.length > 1) {
    const files = matchingFiles.map((file) => path.relative(repoRoot, file.absolutePath)).join(", ")
    throw new Error(`Multiple runs share slug "${slug}": ${files}`)
  }

  return matchingFiles[0]
}

function createClient() {
  const bucket = process.env.R2_BUCKET || process.env.R2_BUCKET_NAME
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
    throw new Error(`Missing required environment variables: ${missingValues.join(", ")}`)
  }

  return {
    bucket,
    client: new S3Client({
      credentials: accessKeyId && secretAccessKey
        ? {
            accessKeyId,
            secretAccessKey,
          }
        : undefined,
      endpoint,
      region: "auto",
    }),
  }
}

function resolvePublicBaseUrl() {
  const publicBaseUrl = (
    process.env.NUXT_PUBLIC_MEDIA_BASE_URL ||
    process.env.R2_PUBLIC_BASE_URL ||
    process.env.NUXT_PUBLIC_ASSET_BASE_URL ||
    process.env.MEDIA_BASE_URL ||
    ""
  ).trim().replace(/\/+$/g, "")

  if (!publicBaseUrl) {
    throw new Error("Missing public base URL. Set NUXT_PUBLIC_MEDIA_BASE_URL, R2_PUBLIC_BASE_URL, or NUXT_PUBLIC_ASSET_BASE_URL.")
  }

  return publicBaseUrl
}

async function buildUploadPlan(filePath, slug) {
  const absoluteFilePath = path.resolve(process.cwd(), filePath)
  const stats = await fs.stat(absoluteFilePath).catch(() => null)

  if (!stats?.isFile()) {
    throw new Error(`Expected a file at ${absoluteFilePath}`)
  }

  if (path.extname(absoluteFilePath).toLowerCase() !== ".zip") {
    throw new Error(`Expected a .zip file, received ${path.basename(absoluteFilePath)}`)
  }

  const body = await fs.readFile(absoluteFilePath)
  const hash = createHash("sha1").update(body).digest("hex").slice(0, 10)
  const sanitizedFilename = sanitizeFilename(path.basename(absoluteFilePath))
  const extension = path.extname(sanitizedFilename)
  const basename = sanitizedFilename.slice(0, -extension.length)
  const objectName = `${basename}-${hash}${extension}`
  const key = `downloads/wallpapers/${slug}/${objectName}`
  const publicUrl = `${resolvePublicBaseUrl()}/${key}`

  return {
    absoluteFilePath,
    body,
    contentDisposition: `attachment; filename="${path.basename(absoluteFilePath).replace(/"/g, "")}"`,
    contentType: "application/zip",
    key,
    publicUrl,
  }
}

async function writeRunFile(absolutePath, parsed, wallpaperPackUrl) {
  const nextData = setWallpaperPackUrl(parsed.data || {}, wallpaperPackUrl)
  const body = parsed.content ? parsed.content.replace(/^\n*/, "\n") : "\n"
  const source = `---\n${stringifyFrontmatter(nextData)}\n---${body}`
  await fs.writeFile(absolutePath, source)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const slug = slugify(args.slug)

  if (!slug) {
    throw new Error(`Could not derive a usable slug from "${args.slug}"`)
  }

  const runFile = await findRunFileBySlug(slug)
  const uploadPlan = await buildUploadPlan(args.file, slug)

  console.log(`Run: ${path.relative(repoRoot, runFile.absolutePath)}`)
  console.log(`Upload: ${uploadPlan.absoluteFilePath}`)
  console.log(`R2 key: ${uploadPlan.key}`)
  console.log(`URL: ${uploadPlan.publicUrl}`)

  if (args.dryRun) {
    console.log("Dry run complete. No upload or markdown update performed.")
    return
  }

  const { bucket, client } = createClient()

  await client.send(new PutObjectCommand({
    Body: uploadPlan.body,
    Bucket: bucket,
    CacheControl: "public, max-age=31536000, immutable",
    ContentDisposition: uploadPlan.contentDisposition,
    ContentType: uploadPlan.contentType,
    Key: uploadPlan.key,
  }))

  await writeRunFile(runFile.absolutePath, runFile.parsed, uploadPlan.publicUrl)

  console.log(`Uploaded to s3://${bucket}/${uploadPlan.key}`)
  console.log(`Updated ${path.relative(repoRoot, runFile.absolutePath)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
