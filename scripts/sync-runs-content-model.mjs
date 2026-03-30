import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import matter from "gray-matter"
import YAML from "yaml"

const repoRoot = process.cwd()
const runsDir = path.join(repoRoot, "content", "runs")
const publicDir = path.join(repoRoot, "public")
const originalsDir = path.join(repoRoot, "assets", "photo-originals")
const write = process.argv.includes("--write")
const allowLegacyPictures = process.argv.includes("--allow-legacy-pictures")

const validStatuses = new Set(["draft", "scheduled", "published", "archived"])

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "")
}

function normalizeNumericValue(value, fallback = 0) {
  if (typeof value === "number") {
    return value
  }

  const parsed = Number.parseFloat(String(value ?? "").trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

function inferOrientation(src = "") {
  const lower = src.toLowerCase()

  if (lower.includes("portrait") || lower.includes("vertical")) {
    return "portrait"
  }

  if (lower.includes("square") || lower.includes("carre")) {
    return "square"
  }

  return "landscape"
}

function normalizeGalleryImage(image, fallbackAlt) {
  if (!image) {
    return null
  }

  if (typeof image === "string") {
    return {
      src: image,
      alt: fallbackAlt,
      caption: "",
      orientation: inferOrientation(image),
    }
  }

  const src = image.src || image.url
  if (!src) {
    return null
  }

  return {
    src,
    alt: image.alt || fallbackAlt,
    caption: image.caption || "",
    orientation: image.orientation || inferOrientation(src),
  }
}

function dedupeGallery(gallery) {
  const seen = new Set()
  return gallery.filter((image) => {
    if (!image?.src || seen.has(image.src)) {
      return false
    }

    seen.add(image.src)
    return true
  })
}

function normalizeProduct(product, runTitle, index) {
  const title = firstDefined(product.title, `${runTitle} ${index + 1}`)
  const slug = firstDefined(product.slug, slugify(title))
  const legacyImages = Array.isArray(product.images) ? product.images.filter(Boolean) : []
  const gallery = dedupeGallery(
    (Array.isArray(product.gallery) ? product.gallery : legacyImages)
      .map((image) => normalizeGalleryImage(image, title))
      .filter(Boolean),
  )

  const heroImage = firstDefined(product.heroImage, gallery[0]?.src, legacyImages[0], "")

  return {
    sku: firstDefined(product.sku, slug),
    title,
    slug,
    description: firstDefined(product.description, ""),
    price: normalizeNumericValue(product.price),
    stock: normalizeNumericValue(product.stock),
    heroImage,
    gallery,
    images: gallery.map((image) => image.src),
  }
}

function normalizeRun(data) {
  const title = firstDefined(data.title, "Untitled run")
  const products = (Array.isArray(data.products) ? data.products : []).map((product, index) =>
    normalizeProduct(product || {}, title, index),
  )
  const derivedSeriesGallery = dedupeGallery(
    products
      .flatMap((product) => product.gallery)
      .map((image) =>
        normalizeGalleryImage(image, `${title} gallery image`),
      )
      .filter(Boolean),
  )

  const seriesGallery = dedupeGallery(
    (Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : derivedSeriesGallery)
      .map((image) => normalizeGalleryImage(image, `${title} gallery image`))
      .filter(Boolean),
  )

  const coverImage = firstDefined(
    data.coverImage,
    data.cover,
    seriesGallery[0]?.src,
    products[0]?.heroImage,
    "",
  )
  const heroImage = firstDefined(
    data.heroImage,
    coverImage,
    seriesGallery[0]?.src,
    "",
  )
  const status = validStatuses.has(data.status) ? data.status : "published"

  return {
    title,
    slug: firstDefined(data.slug, slugify(title)),
    description: firstDefined(data.description, ""),
    date: firstDefined(data.date, new Date().toISOString()),
    status,
    coverImage,
    heroImage,
    gallery: seriesGallery,
    storyBlocks: Array.isArray(data.storyBlocks) ? data.storyBlocks : [],
    products,
  }
}

function isLegacyPicturesRef(src = "") {
  return src.startsWith("/pictures/")
}

function isR2RunMediaRef(src = "") {
  return src.startsWith("/media/runs/")
}

async function resolveLegacySourcePath(src) {
  const relativePath = src.replace(/^\//, "")
  const candidates = [
    path.join(originalsDir, relativePath),
    path.join(publicDir, relativePath),
  ]

  for (const candidate of candidates) {
    if (await awaitExists(candidate)) {
      return candidate
    }
  }

  return null
}

async function validateRun(file, run) {
  const problems = []
  const seenImageSources = new Set()

  if (!run.title) problems.push("missing title")
  if (!run.slug) problems.push("missing slug")
  if (!run.date) problems.push("missing date")
  if (!validStatuses.has(run.status)) problems.push(`invalid status "${run.status}"`)
  if (!run.products.length) problems.push("must contain at least one product")

  for (const image of [...run.gallery, ...run.products.flatMap((product) => product.gallery)]) {
    const src = image?.src || ""

    if (!src) {
      problems.push("image src is empty")
      continue
    }

    if (seenImageSources.has(src)) {
      continue
    }
    seenImageSources.add(src)

    if (isLegacyPicturesRef(src)) {
      if (!allowLegacyPictures) {
        problems.push(`legacy /pictures/ run image ref is no longer allowed after R2 cutover: ${src}`)
        continue
      }

      const sourcePath = await resolveLegacySourcePath(src)
      if (!sourcePath) {
        problems.push(`missing legacy source image: ${src}`)
      }
      continue
    }

    if (isR2RunMediaRef(src)) {
      continue
    }
    problems.push(`image path must start with /media/runs/${allowLegacyPictures ? " or /pictures/" : ""}: ${src}`)
  }

  for (const product of run.products) {
    if (!product.slug) problems.push(`product "${product.title}" is missing slug`)
    if (product.gallery.length === 0) {
      problems.push(`product "${product.title}" has no gallery images`)
    }
  }

  return problems.map((problem) => `${file}: ${problem}`)
}

function awaitExists(filePath) {
  return fs
    .access(filePath)
    .then(() => true)
    .catch(() => false)
}

function stringifyFrontmatter(data) {
  const doc = new YAML.Document()
  doc.contents = data
  return doc.toString({ lineWidth: 0 }).trimEnd()
}

const files = (await fs.readdir(runsDir))
  .filter((file) => file.endsWith(".md"))
  .sort()

const validationErrors = []

for (const file of files) {
  const absolutePath = path.join(runsDir, file)
  const source = await fs.readFile(absolutePath, "utf8")
  const parsed = matter(source)
  const normalized = normalizeRun(parsed.data)
  const nextSource = `---\n${stringifyFrontmatter(normalized)}\n---\n${parsed.content.replace(/^\n+/, "\n")}`

  validationErrors.push(...(await validateRun(file, normalized)))

  if (write && nextSource !== source) {
    await fs.writeFile(absolutePath, nextSource)
  }
}

if (validationErrors.length > 0) {
  console.error("Run content model validation failed:\n")
  for (const error of validationErrors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `${write ? "Normalized and validated" : "Validated"} ${files.length} run files in content/runs.`,
)
