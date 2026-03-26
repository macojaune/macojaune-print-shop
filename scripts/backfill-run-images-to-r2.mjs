#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..")
const runsDir = path.join(repoRoot, "content", "runs")
const originalDirs = [
  path.join(repoRoot, "assets", "photo-originals", "pictures"),
  path.join(repoRoot, "public", "pictures"),
]

const uploadUrl = process.env.RUN_MEDIA_UPLOAD_URL || "http://127.0.0.1:3211/api/media/upload"
const directory = process.env.RUN_MEDIA_DIRECTORY || "runs-backfill"
const dryRun = process.argv.includes("--dry-run")

const contentTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
])

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

async function uploadSource(sourcePath) {
  const extension = path.extname(sourcePath).toLowerCase()
  const contentType = contentTypes.get(extension) || "application/octet-stream"
  const filename = path.basename(sourcePath)
  const buffer = await fs.readFile(sourcePath)
  const formData = new FormData()

  formData.append("file", new File([buffer], filename, { type: contentType }))
  formData.append("directory", directory)

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed for ${filename}: ${response.status} ${await response.text()}`)
  }

  return response.json()
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

    const uploaded = await uploadSource(sourcePath)
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
