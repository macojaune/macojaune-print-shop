#!/usr/bin/env node

import { createHash } from "node:crypto"
import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"
import YAML from "yaml"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const require = createRequire(import.meta.url)
const jiti = require("jiti")(__filename)
const { createR2ProjectImageAsset } = jiti(path.join(repoRoot, "server", "utils", "r2-project-images.ts"))

const projectsDir = path.join(repoRoot, "content", "projects")
const originalsDir = path.join(repoRoot, "assets", "project-originals", "pictures")
const publicPicturesDir = path.join(repoRoot, "public", "pictures")
const write = process.argv.includes("--write")

loadEnvFile(path.join(repoRoot, ".env"))

function loadEnvFile(target) {
  if (!existsSync(target)) {
    return
  }

  const lines = readFileSync(target, "utf8").split(/\r?\n/)

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
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    } else {
      value = value.replace(/\s+#.*$/, "")
    }

    process.env[key] = value
  }
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s/-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
}

function isLegacyPicturesRef(value = "") {
  return value.startsWith("/pictures/")
}

function isProjectMediaRef(value = "") {
  return value.startsWith("/media/projects/")
}

async function resolveLegacySourcePath(src) {
  const relativePath = decodeURIComponent(src.replace(/^\/pictures\//, ""))
  const candidates = [
    path.join(originalsDir, relativePath),
    path.join(publicPicturesDir, relativePath),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // continue
    }
  }

  return null
}

function stringifyFrontmatter(data) {
  const doc = new YAML.Document()
  doc.contents = data
  return doc.toString({ lineWidth: 0 }).trimEnd()
}

function reorderProjectData(data) {
  const orderedData = {}
  const keys = [
    "layout",
    "title",
    "permalink",
    "date",
    "updatedAt",
    "images",
    "categories",
    "tags",
    "pinterestUrl",
    "draft",
  ]

  for (const key of keys) {
    if (data[key] !== undefined) {
      orderedData[key] = data[key]
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!(key in orderedData)) {
      orderedData[key] = value
    }
  }

  return orderedData
}

async function syncProjectFile(filename) {
  const absolutePath = path.join(projectsDir, filename)
  const source = await fs.readFile(absolutePath, "utf8")
  const parsed = matter(source)
  const data = { ...parsed.data }
  const projectSlug = slugify(String(data.permalink || data.title || path.parse(filename).name))
  const currentImages = Array.isArray(data.images)
    ? data.images.filter((entry) => typeof entry === "string" && entry.trim())
    : typeof data.image === "string" && data.image.trim()
      ? [data.image.trim()]
      : []

  if (!currentImages.length) {
    return { filename, changed: false, uploaded: 0 }
  }

  let uploaded = 0
  let changed = false
  const nextImages = []

  for (const image of currentImages) {
    if (isProjectMediaRef(image)) {
      nextImages.push(image)
      continue
    }

    if (!isLegacyPicturesRef(image)) {
      nextImages.push(image)
      continue
    }

    const sourcePath = await resolveLegacySourcePath(image)

    if (!sourcePath) {
      throw new Error(`Missing project source image for ${filename}: ${image}`)
    }

    const dataBuffer = await fs.readFile(sourcePath)
    const hash = createHash("sha1").update(dataBuffer).digest("hex").slice(0, 10)
    const basename = slugify(path.parse(sourcePath).name) || "image"
    const assetId = `${projectSlug}/${basename}-${hash}`
    const manifest = await createR2ProjectImageAsset(
      {
        filename: path.basename(sourcePath),
        type: undefined,
        data: dataBuffer,
      },
      assetId,
    )

    nextImages.push(manifest.src)
    uploaded += 1
    changed = true
  }

  if (!changed) {
    return { filename, changed: false, uploaded }
  }

  const nextData = reorderProjectData({
    ...data,
    updatedAt: new Date().toISOString(),
    images: nextImages,
  })

  delete nextData.image

  const nextSource = `---\n${stringifyFrontmatter(nextData)}\n---\n${parsed.content.startsWith("\n") ? parsed.content : `\n${parsed.content}`}`

  if (write) {
    await fs.writeFile(absolutePath, nextSource, "utf8")
  }

  return { filename, changed: true, uploaded }
}

async function run() {
  const files = (await fs.readdir(projectsDir)).filter((file) => file.endsWith(".md"))
  let totalUploaded = 0
  let changedFiles = 0

  for (const file of files) {
    const result = await syncProjectFile(file)
    totalUploaded += result.uploaded
    changedFiles += result.changed ? 1 : 0
    console.log(`${result.changed ? "updated" : "checked"} ${file} (${result.uploaded} upload${result.uploaded > 1 ? "s" : ""})`)
  }

  if (!write) {
    console.log("\nDry run only. Re-run with --write to persist updated /media/projects/* refs.")
  }

  console.log(`\nProcessed ${files.length} project files, uploaded ${totalUploaded} images, changed ${changedFiles} files.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
