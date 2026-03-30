#!/usr/bin/env node

import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const runsDir = path.join(repoRoot, "content", "runs")
const require = createRequire(import.meta.url)
const jiti = require("jiti")(__filename)

globalThis.useRuntimeConfig = () => ({ r2: {}, public: {} })
globalThis.createError = (input) => Object.assign(new Error(input?.statusMessage || "R2 image pipeline error."), input)

const { createR2ImageAsset } = jiti(path.join(repoRoot, "server", "utils", "r2-images.ts"))
const originalDirs = [
  path.join(repoRoot, "assets", "photo-originals", "pictures"),
  path.join(repoRoot, "public", "pictures"),
]

const directory = process.env.RUN_MEDIA_DIRECTORY || "runs-backfill"
const dryRun = process.argv.includes("--dry-run")

const contentTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
])

function sanitizeSegment(value) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s/-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    .toLowerCase()
}

function collectRunImageRefs(markdown) {
  return [...markdown.matchAll(/\/pictures\/[^\s"')]+/g)].map((match) => match[0])
}

async function findSourceFile(src) {
  const relativePath = src.replace(/^\/pictures\//, "")

  for (const baseDir of originalDirs) {
    const candidate = path.join(baseDir, relativePath)
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  return null
}

async function uploadSource(sourcePath, legacyRef) {
  const extension = path.extname(sourcePath).toLowerCase()
  const contentType = contentTypes.get(extension) || "application/octet-stream"
  const filename = path.basename(sourcePath)
  const buffer = await fs.readFile(sourcePath)
  const manifest = await createR2ImageAsset(
    {
      filename,
      type: contentType,
      data: buffer,
    },
    undefined,
    makeStableAssetId(filename, legacyRef, buffer),
  )

  return {
    src: manifest.src,
  }
}

function makeStableAssetId(filename, legacyRef, buffer) {
  const basename = sanitizeSegment(path.parse(filename).name) || "image"
  const logicalDirectory = sanitizeSegment(
    path.posix.dirname(String(legacyRef || "").replace(/^\/+/, "").replace(/^pictures\//, "")),
  )
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 10)
  const leaf = `${basename}-${hash}`

  return [directory, logicalDirectory, leaf].filter(Boolean).join("/")
}

async function main() {
  const files = (await fs.readdir(runsDir))
    .filter((file) => file.endsWith(".md"))
    .sort()

  const contents = new Map()
  const refs = new Set()

  for (const file of files) {
    const absolutePath = path.join(runsDir, file)
    const markdown = await fs.readFile(absolutePath, "utf8")
    contents.set(absolutePath, markdown)

    for (const ref of collectRunImageRefs(markdown)) {
      refs.add(ref)
    }
  }

  const refMap = new Map()

  for (const ref of [...refs].sort()) {
    const sourcePath = await findSourceFile(ref)

    if (!sourcePath) {
      throw new Error(`Missing source file for ${ref}`)
    }

    if (dryRun) {
      console.log(`[dry-run] ${ref} -> ${sourcePath}`)
      continue
    }

    const uploaded = await uploadSource(sourcePath, ref)
    refMap.set(ref, uploaded.src)
    console.log(`${ref} -> ${uploaded.src}`)
  }

  if (dryRun) {
    return
  }

  for (const [absolutePath, originalMarkdown] of contents.entries()) {
    let updatedMarkdown = originalMarkdown

    for (const [legacyRef, canonicalRef] of refMap.entries()) {
      updatedMarkdown = updatedMarkdown.split(legacyRef).join(canonicalRef)
    }

    if (updatedMarkdown !== originalMarkdown) {
      await fs.writeFile(absolutePath, updatedMarkdown)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
