#!/usr/bin/env node

import { createHash } from "node:crypto"
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { existsSync, promises as fs, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { createInterface } from "node:readline/promises"
import { fileURLToPath } from "node:url"

import matter from "gray-matter"
import sharp from "sharp"
import YAML from "yaml"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const runsDir = path.join(repoRoot, "content", "runs")
const require = createRequire(import.meta.url)
const jiti = require("jiti")(__filename)

loadEnvFile(path.join(repoRoot, ".env"))

globalThis.useRuntimeConfig = () => ({ r2: {}, public: {} })
globalThis.createError = (input) => Object.assign(new Error(input?.statusMessage || "R2 image pipeline error."), input)

const { createR2ImageAsset } = jiti(path.join(repoRoot, "server", "utils", "r2-images.ts"))

const contentTypes = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
])

const genericLeafDirectoryNames = new Set(["ig", "insta", "instagram", "web", "site", "export", "exports", "selection", "selections"])

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
  node scripts/import-series.mjs --source <path> [--all] [--dry-run|--write]

Options:
  --source <path>     Series folder or batch root.
  --all               Treat source as a batch root containing multiple series folders.
  --dry-run           Validate and print the planned import without uploading or writing.
  --write             Upload to R2 and write content/runs/*.md entries.
  --title <value>     Override inferred or manifest title for a single-series import.
  --slug <value>      Override inferred or manifest slug for a single-series import.
  --date <value>      Override inferred or manifest date for a single-series import.
  --description <v>   Override inferred or manifest description for a single-series import.
  --cover <value>     Choose cover photo by filename or inferred photo id.
  --hero <value>      Choose hero photo by filename or inferred photo id.

Supported input shapes:
  1. series-folder/series.yaml + photos/*
  2. series-folder/*.{jpg,jpeg,png,webp,avif}
  3. single-series mode only: series-folder/**/*.{jpg,jpeg,png,webp,avif}

Single-series write mode can prompt for missing metadata when running in an interactive terminal.
`)

  process.exit(message ? 1 : 0)
}

function parseArgs(argv) {
  const args = {
    source: "",
    all: false,
    dryRun: false,
    write: false,
    metadata: {
      title: "",
      slug: "",
      date: "",
      description: "",
      cover: "",
      hero: "",
    },
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--source") {
      args.source = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--title") {
      args.metadata.title = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--slug") {
      args.metadata.slug = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--date") {
      args.metadata.date = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--description") {
      args.metadata.description = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--cover") {
      args.metadata.cover = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--hero") {
      args.metadata.hero = argv[index + 1] || ""
      index += 1
      continue
    }

    if (arg === "--all") {
      args.all = true
      continue
    }

    if (arg === "--dry-run") {
      args.dryRun = true
      continue
    }

    if (arg === "--write") {
      args.write = true
      continue
    }

    if (arg === "--help" || arg === "-h") {
      usage()
    }

    usage(`Unknown argument "${arg}"`)
  }

  if (!args.source) {
    usage("Missing required --source path")
  }

  if (args.dryRun === args.write) {
    usage("Choose exactly one of --dry-run or --write")
  }

  if (
    args.all &&
    Object.values(args.metadata).some((value) => String(value || "").trim())
  ) {
    usage("Series-level metadata flags are only supported for single-series imports")
  }

  return args
}

function formatDuration(milliseconds) {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`
  }

  if (milliseconds < 60_000) {
    return `${(milliseconds / 1000).toFixed(1)}s`
  }

  const minutes = Math.floor(milliseconds / 60_000)
  const seconds = ((milliseconds % 60_000) / 1000).toFixed(1)
  return `${minutes}m${seconds}s`
}

function createWriteProgressTracker(seriesList) {
  const startedAt = Date.now()
  const totalSeries = seriesList.length
  const totalPhotos = seriesList.reduce((count, series) => count + series.photos.length, 0)
  let uploadedPhotos = 0

  const prefix = (seriesIndex, photoIndex, photoCount) =>
    `[series ${seriesIndex + 1}/${totalSeries}${photoCount ? ` | photo ${photoIndex + 1}/${photoCount}` : ""}${totalPhotos ? ` | total ${uploadedPhotos}/${totalPhotos}` : ""}]`

  return {
    start() {
      console.log(`Write mode: ${totalSeries} series, ${totalPhotos} photos to upload.`)
    },
    seriesStart(series, seriesIndex) {
      console.log(`\n${prefix(seriesIndex)} ${series.slug} (${series.photos.length} photos)`)
    },
    photoStart(seriesIndex, photoIndex, photoCount, photo) {
      console.log(`${prefix(seriesIndex, photoIndex, photoCount)} Uploading ${photo.filename}`)
    },
    photoDone(seriesIndex, photoIndex, photoCount, photo, outputSrc, uploadStartedAt) {
      uploadedPhotos += 1
      console.log(
        `${prefix(seriesIndex, photoIndex, photoCount)} Uploaded ${photo.filename} -> ${outputSrc} in ${formatDuration(Date.now() - uploadStartedAt)}`,
      )
    },
    runFileWritten(seriesIndex, targetPath, writeStartedAt) {
      console.log(
        `[series ${seriesIndex + 1}/${totalSeries}] Wrote ${path.relative(repoRoot, targetPath)} in ${formatDuration(Date.now() - writeStartedAt)}`,
      )
    },
    syncStart() {
      console.log(`\n[finalize] Running sync-runs-content-model --write`)
    },
    complete() {
      console.log(`\nWrite completed in ${formatDuration(Date.now() - startedAt)}.`)
    },
  }
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

function sanitizeSegment(value = "") {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s/-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    .toLowerCase()
}

function normalizeDate(value) {
  if (!value) {
    return new Date().toISOString()
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date "${value}"`)
  }

  return date.toISOString()
}

function stringifyFrontmatter(data) {
  const doc = new YAML.Document()
  doc.contents = data
  return doc.toString({ lineWidth: 0 }).trimEnd()
}

function sortNaturally(values) {
  return values.sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }))
}

function humanizeFilename(value = "") {
  return path.parse(value).name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function inferSeriesNameFromDirectory(seriesDir) {
  const basename = path.basename(seriesDir)
  const parentName = path.basename(path.dirname(seriesDir))
  const selectedName = genericLeafDirectoryNames.has(slugify(basename)) && parentName
    ? parentName
    : basename

  return humanizeFilename(selectedName) || selectedName
}

function createValue(value, source) {
  return { value, source }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

async function assertDirectory(targetPath) {
  const stats = await fs.stat(targetPath).catch(() => null)
  if (!stats?.isDirectory()) {
    throw new Error(`Expected a directory at ${targetPath}`)
  }
}

function isSupportedImageFile(filePath) {
  return contentTypes.has(path.extname(filePath).toLowerCase())
}

async function listImageFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  return sortNaturally(
    entries
      .filter((entry) => entry.isFile() && isSupportedImageFile(entry.name))
      .map((entry) => entry.name),
  )
}

async function listImageFilesRecursive(directory, baseDirectory = directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...await listImageFilesRecursive(entryPath, baseDirectory))
      continue
    }

    if (!entry.isFile() || !isSupportedImageFile(entry.name)) {
      continue
    }

    files.push(path.relative(baseDirectory, entryPath))
  }

  return sortNaturally(files)
}

async function detectSeriesInputShape(seriesDir, options = {}) {
  const { recursiveFlat = false } = options
  const manifestPath = path.join(seriesDir, "series.yaml")
  const photosDir = path.join(seriesDir, "photos")

  if (await pathExists(manifestPath)) {
    return {
      kind: "manifest",
      manifestPath,
      photosDir,
      imageFiles: [],
    }
  }

  if (recursiveFlat) {
    const recursiveImages = await listImageFilesRecursive(seriesDir)
    if (recursiveImages.length > 0) {
      return {
        kind: "recursive-flat",
        manifestPath,
        photosDir: seriesDir,
        imageFiles: recursiveImages,
      }
    }
  }

  const flatImages = await listImageFiles(seriesDir)
  if (flatImages.length > 0) {
    return {
      kind: "flat",
      manifestPath,
      photosDir: seriesDir,
      imageFiles: flatImages,
    }
  }

  if (await pathExists(photosDir)) {
    const nestedImages = await listImageFiles(photosDir)
    if (nestedImages.length > 0) {
      return {
        kind: "flat-photos",
        manifestPath,
        photosDir,
        imageFiles: nestedImages,
      }
    }
  }

  return {
    kind: "unknown",
    manifestPath,
    photosDir,
    imageFiles: [],
  }
}

async function collectSeriesDirectories(sourcePath, all) {
  if (!all) {
    return [sourcePath]
  }

  const entries = await fs.readdir(sourcePath, { withFileTypes: true })
  const directories = []

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    const candidate = path.join(sourcePath, entry.name)
    const detected = await detectSeriesInputShape(candidate)
    if (detected.kind !== "unknown") {
      directories.push(candidate)
    }
  }

  if (directories.length === 0) {
    throw new Error(`No importable series folders found in ${sourcePath}`)
  }

  return sortNaturally(directories)
}

async function loadExistingRuns() {
  const files = sortNaturally(
    (await fs.readdir(runsDir)).filter((file) => file.endsWith(".md")),
  )

  const bySlug = new Map()

  for (const file of files) {
    const absolutePath = path.join(runsDir, file)
    const source = await fs.readFile(absolutePath, "utf8")
    const parsed = matter(source)
    const slug = parsed.data?.slug

    if (!slug) {
      continue
    }

    bySlug.set(slug, {
      file,
      absolutePath,
      data: parsed.data,
      content: parsed.content,
    })
  }

  return bySlug
}

async function readYamlFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8")
  const parsed = YAML.parse(raw)

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid YAML document in ${filePath}`)
  }

  return parsed
}

function inferOrientation(metadata) {
  if (metadata.width && metadata.height) {
    if (metadata.width === metadata.height) {
      return "square"
    }

    return metadata.width > metadata.height ? "landscape" : "portrait"
  }

  return "landscape"
}

function resolvePhotoReference(reference, photos, label) {
  const raw = String(reference || "").trim()
  if (!raw) {
    return ""
  }

  const rawStem = path.parse(raw).name.toLowerCase()
  const rawSlug = slugify(raw)

  const match = photos.find((photo) => {
    const photoStem = path.parse(photo.file).name.toLowerCase()
    return photo.file === raw || photo.id === raw || photo.id === rawSlug || photoStem === rawStem
  })

  if (!match) {
    throw new Error(`${label} "${raw}" does not match any imported photo filename or id`)
  }

  return match.file
}

async function promptWithDefault(rl, label, fallbackValue, validate) {
  const suffix = fallbackValue ? ` [${fallbackValue}]` : ""

  while (true) {
    const answer = String(await rl.question(`${label}${suffix}: `)).trim()
    const value = answer || fallbackValue || ""

    if (validate) {
      try {
        return validate(value)
      } catch (error) {
        console.error(error.message)
      }
      continue
    }

    return value
  }
}

async function promptForSeriesMetadata(series) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    const titleValue = await promptWithDefault(rl, "Series title", series.title, (value) => {
      if (!String(value || "").trim()) {
        throw new Error("Series title cannot be empty")
      }
      return String(value).trim()
    })

    if (titleValue !== series.title) {
      series.title = titleValue
      series.metadata.title.source = "prompt"
    }

    const slugValue = await promptWithDefault(rl, "Series slug", series.slug, (value) => {
      const normalized = slugify(value)
      if (!normalized) {
        throw new Error("Series slug must contain at least one usable character")
      }
      return normalized
    })

    if (slugValue !== series.slug) {
      series.slug = slugValue
      series.metadata.slug.source = "prompt"
    }

    const dateValue = await promptWithDefault(rl, "Series date", series.date, (value) => normalizeDate(value))
    if (dateValue !== series.date) {
      series.date = dateValue
      series.metadata.date.source = "prompt"
    }

    const descriptionValue = await promptWithDefault(rl, "Series description", series.description)
    if (descriptionValue !== series.description) {
      series.description = descriptionValue
      series.metadata.description.source = "prompt"
    }

    const coverValue = await promptWithDefault(rl, "Cover photo filename or id", series.coverFile, (value) => resolvePhotoReference(value, series.photos, "Cover"))
    if (coverValue !== series.coverFile) {
      series.coverFile = coverValue
      series.metadata.cover.source = "prompt"
    }

    const heroValue = await promptWithDefault(rl, "Hero photo filename or id", series.heroFile, (value) => resolvePhotoReference(value, series.photos, "Hero"))
    if (heroValue !== series.heroFile) {
      series.heroFile = heroValue
      series.metadata.hero.source = "prompt"
    }
  } finally {
    rl.close()
  }
}

async function readPhotoEntry(seriesSlug, photosDir, photo, index, sourceLabel) {
  const normalizedPhoto = typeof photo === "string" ? { file: photo } : photo

  if (!normalizedPhoto || typeof normalizedPhoto !== "object") {
    throw new Error(`Photo entry #${index + 1} must be an object or filename`)
  }

  const file = String(normalizedPhoto.file || "").trim()
  if (!file) {
    throw new Error(`Photo entry #${index + 1} is missing "file"`)
  }

  const inferredTitle = humanizeFilename(file) || path.parse(file).name
  const inferredIdSource = normalizedPhoto.id
    ? String(normalizedPhoto.id)
    : file.includes("/")
      ? path.join(path.dirname(file), path.parse(file).name)
      : path.parse(file).name
  const id = slugify(inferredIdSource)
  if (!id) {
    throw new Error(`Photo entry "${file}" is missing a usable id`)
  }

  const filePath = path.join(photosDir, file)

  if (!(await pathExists(filePath))) {
    throw new Error(`Referenced photo file is missing: ${filePath}`)
  }

  const buffer = await fs.readFile(filePath)
  const metadata = await sharp(buffer).rotate().metadata()
  const extension = path.extname(file).toLowerCase()
  const hash = createHash("sha1").update(buffer).digest("hex").slice(0, 10)
  const assetId = [sanitizeSegment(seriesSlug), `${sanitizeSegment(id)}-${hash}`]
    .filter(Boolean)
    .join("/")

  const title = String(normalizedPhoto.title || inferredTitle).trim()
  const alt = String(normalizedPhoto.alt || normalizedPhoto.title || inferredTitle).trim()
  const caption = String(normalizedPhoto.caption || "").trim()

  return {
    id,
    title,
    titleSource: normalizedPhoto.title ? sourceLabel : "inferred",
    alt,
    altSource: normalizedPhoto.alt ? sourceLabel : "inferred",
    caption,
    captionSource: normalizedPhoto.caption ? sourceLabel : "inferred",
    file,
    filePath,
    filename: path.basename(file),
    buffer,
    extension,
    contentType: contentTypes.get(extension) || "application/octet-stream",
    orientation: inferOrientation(metadata),
    assetId,
    canonicalSrc: `/media/runs/${assetId}`,
  }
}

async function buildPhotosFromEntries(seriesSlug, photosDir, entries, sourceLabel, duplicateContext) {
  const photos = []
  const seenPhotoIds = new Set()

  for (const [index, entry] of entries.entries()) {
    const photo = await readPhotoEntry(seriesSlug, photosDir, entry, index, sourceLabel)
    if (seenPhotoIds.has(photo.id)) {
      throw new Error(`Duplicate photo id "${photo.id}" in ${duplicateContext}`)
    }
    seenPhotoIds.add(photo.id)
    photos.push(photo)
  }

  return photos
}

function resolveMetadataValue(explicitValue, fallbackValue, fallbackSource, transform) {
  const explicit = String(explicitValue || "").trim()
  if (explicit) {
    return createValue(transform ? transform(explicit) : explicit, "explicit")
  }

  return createValue(transform ? transform(fallbackValue) : fallbackValue, fallbackSource)
}

async function parseManifestSeries(seriesDir, detected, args) {
  if (!(await pathExists(detected.photosDir))) {
    throw new Error(`Missing photos/ directory in ${seriesDir}`)
  }

  const manifest = await readYamlFile(detected.manifestPath)
  const rawTitle = String(manifest.title || "").trim()
  const inferredTitle = inferSeriesNameFromDirectory(seriesDir)
  const titleMeta = resolveMetadataValue(args.metadata.title, rawTitle || inferredTitle, rawTitle ? "manifest" : "inferred")

  if (!titleMeta.value) {
    throw new Error(`Missing title in ${detected.manifestPath}`)
  }

  const rawSlug = String(manifest.slug || "").trim()
  const slugMeta = resolveMetadataValue(args.metadata.slug, rawSlug || titleMeta.value || path.basename(seriesDir), rawSlug ? "manifest" : "inferred", slugify)

  if (!slugMeta.value) {
    throw new Error(`Missing usable slug in ${detected.manifestPath}`)
  }

  if (!Array.isArray(manifest.photos) || manifest.photos.length === 0) {
    throw new Error(`Expected a non-empty photos[] list in ${detected.manifestPath}`)
  }

  const photos = await buildPhotosFromEntries(
    slugMeta.value,
    detected.photosDir,
    manifest.photos,
    "manifest",
    detected.manifestPath,
  )

  const dateMeta = resolveMetadataValue(args.metadata.date, manifest.date || "", manifest.date ? "manifest" : "inferred", normalizeDate)
  const descriptionMeta = resolveMetadataValue(args.metadata.description, String(manifest.description || "").trim(), manifest.description ? "manifest" : "inferred")
  const coverMeta = resolveMetadataValue(args.metadata.cover, String(manifest.cover || photos[0]?.file || "").trim(), manifest.cover ? "manifest" : "inferred", (value) => resolvePhotoReference(value, photos, "Cover"))
  const heroMeta = resolveMetadataValue(args.metadata.hero, String(manifest.hero || coverMeta.value || "").trim(), manifest.hero ? "manifest" : coverMeta.source, (value) => resolvePhotoReference(value, photos, "Hero"))

  return {
    title: titleMeta.value,
    slug: slugMeta.value,
    date: dateMeta.value,
    description: descriptionMeta.value,
    coverFile: coverMeta.value,
    heroFile: heroMeta.value,
    photos,
    seriesDir,
    manifestPath: detected.manifestPath,
    inputShape: detected.kind,
    metadata: {
      title: titleMeta,
      slug: slugMeta,
      date: dateMeta,
      description: descriptionMeta,
      cover: coverMeta,
      hero: heroMeta,
    },
  }
}

async function parseFlatSeries(seriesDir, detected, args, allowPrompt) {
  const inferredTitle = inferSeriesNameFromDirectory(seriesDir)
  const inferredSlug = slugify(args.metadata.slug || inferredTitle || path.basename(seriesDir))
  const inferredDate = normalizeDate("")

  const titleMeta = resolveMetadataValue(args.metadata.title, inferredTitle, "inferred")
  const slugMeta = resolveMetadataValue(args.metadata.slug, inferredSlug, "inferred", slugify)
  const photos = await buildPhotosFromEntries(
    slugMeta.value,
    detected.photosDir,
    detected.imageFiles.map((file) => ({ file })),
    "flat",
    seriesDir,
  )

  if (photos.length === 0) {
    throw new Error(`No supported image files found in ${seriesDir}`)
  }

  const dateMeta = resolveMetadataValue(args.metadata.date, inferredDate, "inferred", normalizeDate)
  const descriptionMeta = resolveMetadataValue(args.metadata.description, "", "inferred")
  const coverMeta = resolveMetadataValue(args.metadata.cover, photos[0].file, "inferred", (value) => resolvePhotoReference(value, photos, "Cover"))
  const heroMeta = resolveMetadataValue(args.metadata.hero, coverMeta.value, coverMeta.source, (value) => resolvePhotoReference(value, photos, "Hero"))

  const series = {
    title: titleMeta.value,
    slug: slugMeta.value,
    date: dateMeta.value,
    description: descriptionMeta.value,
    coverFile: coverMeta.value,
    heroFile: heroMeta.value,
    photos,
    seriesDir,
    manifestPath: null,
    inputShape: detected.kind,
    metadata: {
      title: titleMeta,
      slug: slugMeta,
      date: dateMeta,
      description: descriptionMeta,
      cover: coverMeta,
      hero: heroMeta,
    },
  }

  const hasMissingMetadata = Object.values(series.metadata).some((entry) => entry.source === "inferred")

  if (allowPrompt && hasMissingMetadata) {
    await promptForSeriesMetadata(series)
    series.photos = await buildPhotosFromEntries(
      series.slug,
      detected.photosDir,
      detected.imageFiles.map((file) => ({ file })),
      "flat",
      seriesDir,
    )
    series.coverFile = resolvePhotoReference(series.coverFile, series.photos, "Cover")
    series.heroFile = resolvePhotoReference(series.heroFile, series.photos, "Hero")
  }

  return series
}

async function parseSeriesDirectory(seriesDir, args) {
  const detected = await detectSeriesInputShape(seriesDir, { recursiveFlat: !args.all })
  const shouldPrompt = !args.all && args.write && process.stdin.isTTY && process.stdout.isTTY

  if (detected.kind === "manifest") {
    return parseManifestSeries(seriesDir, detected, args)
  }

  if (detected.kind === "flat" || detected.kind === "flat-photos" || detected.kind === "recursive-flat") {
    return parseFlatSeries(seriesDir, detected, args, shouldPrompt)
  }

  throw new Error(`Unsupported import layout in ${seriesDir}. Expected series.yaml + photos/, a flat image folder, or nested image folders in single-series mode.`)
}

async function uploadPhoto(photo) {
  const uploaded = await createR2ImageAsset(
    {
      filename: photo.filename,
      type: photo.contentType,
      data: photo.buffer,
    },
    undefined,
    photo.assetId,
  )

  return uploaded.src
}

function makeGalleryImage(photo, src) {
  return {
    src,
    alt: photo.alt,
    caption: photo.caption,
    orientation: photo.orientation,
  }
}

function buildImportedRun(series, uploadedSources) {
  const photoSources = new Map(
    series.photos.map((photo) => [photo.file, uploadedSources.get(photo.file) || photo.canonicalSrc]),
  )

  const gallery = series.photos.map((photo) => makeGalleryImage(photo, photoSources.get(photo.file)))
  const coverImage = photoSources.get(series.coverFile) || gallery[0]?.src || ""
  const heroImage = photoSources.get(series.heroFile) || coverImage

  return {
    title: series.title,
    slug: series.slug,
    description: series.description,
    date: series.date,
    status: "published",
    coverImage,
    heroImage,
    gallery,
    storyBlocks: [],
    products: series.photos.map((photo) => {
      const src = photoSources.get(photo.file)
      return {
        sku: `${series.slug}-${photo.id}`,
        title: photo.title,
        slug: photo.id,
        description: "",
        price: 0,
        stock: 0,
        heroImage: src,
        gallery: [makeGalleryImage(photo, src)],
        images: [src],
      }
    }),
  }
}

function mergeGalleryEntries(existingGallery, importedGallery, photos) {
  const existingBySrc = new Map(
    (Array.isArray(existingGallery) ? existingGallery : [])
      .filter((entry) => entry?.src)
      .map((entry) => [entry.src, entry]),
  )

  return importedGallery.map((entry, index) => {
    const existing = existingBySrc.get(entry.src)
    const photo = photos[index]
    return {
      ...entry,
      alt: photo?.altSource === "inferred" ? existing?.alt || entry.alt : entry.alt,
      caption: photo?.captionSource === "inferred" ? existing?.caption || entry.caption : entry.caption,
    }
  })
}

function mergeProducts(existingProducts, importedProducts, photos) {
  const existingByKey = new Map()
  const photoBySlug = new Map(photos.map((photo) => [photo.id, photo]))

  for (const product of Array.isArray(existingProducts) ? existingProducts : []) {
    const key = product?.slug || product?.sku
    if (key) {
      existingByKey.set(key, product)
    }
  }

  return importedProducts.map((product) => {
    const existing = existingByKey.get(product.slug) || existingByKey.get(product.sku)
    const photo = photoBySlug.get(product.slug)

    if (!existing) {
      return product
    }

    return {
      ...product,
      sku: existing.sku || product.sku,
      title: photo?.titleSource === "inferred" ? existing.title || product.title || "" : product.title || existing.title || "",
      description: existing.description || product.description,
      price: existing.price ?? product.price,
      stock: existing.stock ?? product.stock,
      gallery: mergeGalleryEntries(existing.gallery, product.gallery, photo ? [photo] : []),
    }
  })
}

function mergeRun(existingRun, importedRun, series) {
  if (!existingRun) {
    return importedRun
  }

  return {
    ...importedRun,
    title: series.metadata.title.source === "inferred" ? existingRun.data.title || importedRun.title : importedRun.title,
    date: series.metadata.date.source === "inferred" ? existingRun.data.date || importedRun.date : importedRun.date,
    description: series.metadata.description.source === "inferred"
      ? existingRun.data.description || importedRun.description || ""
      : importedRun.description || existingRun.data.description || "",
    status: existingRun.data.status || importedRun.status,
    gallery: mergeGalleryEntries(existingRun.data.gallery, importedRun.gallery, series.photos),
    storyBlocks: Array.isArray(existingRun.data.storyBlocks) ? existingRun.data.storyBlocks : [],
    products: mergeProducts(existingRun.data.products, importedRun.products, series.photos),
  }
}

async function writeRunFile(targetPath, data, existingContent) {
  const body = existingContent ? existingContent.replace(/^\n*/, "\n") : "\n"
  const source = `---\n${stringifyFrontmatter(data)}\n---${body}`
  await fs.writeFile(targetPath, source)
}

function printPlan(results, modeLabel) {
  console.log(`${modeLabel} ${results.length} series.`)

  for (const result of results) {
    console.log(`\n- ${result.slug} (${result.action})`)
    console.log(`  title: ${result.title}`)
    console.log(`  source: ${result.seriesDir}`)
    console.log(`  input: ${result.inputShape}`)
    console.log(`  target: ${path.relative(repoRoot, result.targetPath)}`)
    console.log(`  photos: ${result.photoCount}`)
    console.log(`  cover: ${result.coverImage}`)
    console.log(`  hero: ${result.heroImage}`)
    for (const photo of result.photos) {
      console.log(`  photo ${photo.id}: ${photo.file} -> ${photo.src}`)
    }
  }
}

async function runSyncValidation() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repoRoot, "scripts", "sync-runs-content-model.mjs"), "--write"], {
      cwd: repoRoot,
      stdio: "inherit",
      env: process.env,
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`sync-runs-content-model exited with code ${code}`))
    })

    child.on("error", reject)
  })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const sourcePath = path.resolve(process.cwd(), args.source)
  await assertDirectory(sourcePath)

  const existingRuns = await loadExistingRuns()
  const seriesDirs = await collectSeriesDirectories(sourcePath, args.all)
  const seenImportedSlugs = new Set()
  const parsedSeries = []

  for (const seriesDir of seriesDirs) {
    const series = await parseSeriesDirectory(seriesDir, args)

    if (seenImportedSlugs.has(series.slug)) {
      throw new Error(`Duplicate imported series slug "${series.slug}"`)
    }
    seenImportedSlugs.add(series.slug)

    const existing = existingRuns.get(series.slug)
    if (!existing) {
      const slugOwner = [...existingRuns.entries()].find(([, run]) => run.data.slug === series.slug)
      if (slugOwner && slugOwner[1].absolutePath !== path.join(runsDir, `${series.slug}.md`)) {
        throw new Error(`Series slug "${series.slug}" already exists in ${slugOwner[1].file}`)
      }
    }

    parsedSeries.push(series)
  }

  const results = []
  const writeProgress = args.write ? createWriteProgressTracker(parsedSeries) : null

  writeProgress?.start()

  for (const [seriesIndex, series] of parsedSeries.entries()) {
    const existing = existingRuns.get(series.slug)
    const uploadedSources = new Map()

    writeProgress?.seriesStart(series, seriesIndex)

    if (args.write) {
      for (const [photoIndex, photo] of series.photos.entries()) {
        const uploadStartedAt = Date.now()
        writeProgress?.photoStart(seriesIndex, photoIndex, series.photos.length, photo)
        const uploadedSrc = await uploadPhoto(photo)
        uploadedSources.set(photo.file, uploadedSrc)
        writeProgress?.photoDone(
          seriesIndex,
          photoIndex,
          series.photos.length,
          photo,
          uploadedSrc,
          uploadStartedAt,
        )
      }
    }

    const importedRun = buildImportedRun(series, uploadedSources)
    const mergedRun = mergeRun(existing, importedRun, series)
    const targetPath = existing?.absolutePath || path.join(runsDir, `${series.slug}.md`)

    if (args.write) {
      const writeStartedAt = Date.now()
      await writeRunFile(targetPath, mergedRun, existing?.content || "")
      writeProgress?.runFileWritten(seriesIndex, targetPath, writeStartedAt)
    }

    existingRuns.set(series.slug, {
      file: path.basename(targetPath),
      absolutePath: targetPath,
      data: mergedRun,
      content: existing?.content || "",
    })

    results.push({
      title: mergedRun.title,
      slug: series.slug,
      action: existing ? "update" : "create",
      targetPath,
      seriesDir: series.seriesDir,
      inputShape: series.inputShape,
      photoCount: series.photos.length,
      coverImage: mergedRun.coverImage,
      heroImage: mergedRun.heroImage,
      photos: series.photos.map((photo) => ({
        id: photo.id,
        file: photo.file,
        src: uploadedSources.get(photo.file) || photo.canonicalSrc,
      })),
    })
  }

  printPlan(results, args.write ? "Imported" : "Dry run for")

  if (args.write) {
    writeProgress?.syncStart()
    await runSyncValidation()
    writeProgress?.complete()
  }
}

main().catch((error) => {
  console.error(`\nImport failed: ${error.message}`)
  process.exitCode = 1
})
