import { promises as fs } from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "yaml"

type RunGalleryEntry = {
  src?: string
  alt?: string
  caption?: string
  orientation?: string
}

type RunProductEntry = {
  heroImage?: string
  images?: string[]
  gallery?: RunGalleryEntry[]
  [key: string]: unknown
}

type RunFrontmatter = {
  slug?: string
  coverImage?: string
  heroImage?: string
  gallery?: RunGalleryEntry[]
  products?: RunProductEntry[]
  [key: string]: unknown
}

const RUNS_DIRECTORY = path.resolve(process.cwd(), "content/runs")

const normalizeSrc = (value?: string) => {
  if (!value) {
    return ""
  }

  let normalized = value.trim()

  for (let index = 0; index < 2; index += 1) {
    try {
      const decoded = decodeURIComponent(normalized)
      if (decoded === normalized) {
        break
      }

      normalized = decoded
    } catch {
      break
    }
  }

  return normalized
}

const serializeFrontmatter = (data: RunFrontmatter) =>
  yaml.stringify(data, {
    defaultStringType: "QUOTE_DOUBLE",
    lineWidth: 0,
    indentSeq: true,
  }).trim()

const findRunFileBySlug = async (slug: string) => {
  const files = await fs.readdir(RUNS_DIRECTORY)

  for (const file of files) {
    if (!file.endsWith(".md")) {
      continue
    }

    const absolutePath = path.join(RUNS_DIRECTORY, file)
    const raw = await fs.readFile(absolutePath, "utf8")
    const parsed = matter(raw)
    const data = parsed.data as RunFrontmatter

    if (String(data.slug || "").trim() === slug) {
      return {
        absolutePath,
        raw,
        parsed,
      }
    }
  }

  return null
}

const productContainsImage = (product: RunProductEntry, targetSrc: string) => {
  if (normalizeSrc(product.heroImage) === targetSrc) {
    return true
  }

  if (Array.isArray(product.images) && product.images.some((entry) => normalizeSrc(entry) === targetSrc)) {
    return true
  }

  if (Array.isArray(product.gallery) && product.gallery.some((entry) => normalizeSrc(entry?.src) === targetSrc)) {
    return true
  }

  return false
}

const getRemainingImageSources = (frontmatter: RunFrontmatter) => {
  const gallerySources = Array.isArray(frontmatter.gallery)
    ? frontmatter.gallery.map((entry) => entry?.src).filter((value): value is string => Boolean(value))
    : []

  if (gallerySources.length) {
    return gallerySources
  }

  if (Array.isArray(frontmatter.products)) {
    return frontmatter.products
      .flatMap((product) => {
        if (Array.isArray(product.gallery) && product.gallery.length) {
          return product.gallery.map((entry) => entry?.src).filter((value): value is string => Boolean(value))
        }

        if (Array.isArray(product.images) && product.images.length) {
          return product.images.filter((value): value is string => Boolean(value))
        }

        return product.heroImage ? [product.heroImage] : []
      })
  }

  return []
}

export const removeRunImageFromContent = async (slug: string, src: string) => {
  const normalizedSlug = String(slug || "").trim()
  const normalizedSrc = normalizeSrc(src)

  if (!normalizedSlug || !normalizedSrc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Slug ou image invalide.",
    })
  }

  const file = await findRunFileBySlug(normalizedSlug)

  if (!file) {
    throw createError({
      statusCode: 404,
      statusMessage: "Fichier de série introuvable.",
    })
  }

  const frontmatter = structuredClone(file.parsed.data as RunFrontmatter)
  const initialGalleryCount = Array.isArray(frontmatter.gallery) ? frontmatter.gallery.length : 0
  const initialProductCount = Array.isArray(frontmatter.products) ? frontmatter.products.length : 0

  if (Array.isArray(frontmatter.gallery)) {
    frontmatter.gallery = frontmatter.gallery.filter((entry) => normalizeSrc(entry?.src) !== normalizedSrc)
  }

  if (Array.isArray(frontmatter.products)) {
    frontmatter.products = frontmatter.products.filter((product) => !productContainsImage(product, normalizedSrc))
  }

  const remainingImageSources = getRemainingImageSources(frontmatter)
  const nextPrimaryImage = remainingImageSources[0] || ""

  if (normalizeSrc(frontmatter.coverImage) === normalizedSrc) {
    frontmatter.coverImage = nextPrimaryImage || undefined
  }

  if (normalizeSrc(frontmatter.heroImage) === normalizedSrc) {
    frontmatter.heroImage = nextPrimaryImage || frontmatter.coverImage || undefined
  }

  const galleryChanged = initialGalleryCount !== (frontmatter.gallery?.length || 0)
  const productsChanged = initialProductCount !== (frontmatter.products?.length || 0)

  if (!galleryChanged && !productsChanged) {
    throw createError({
      statusCode: 404,
      statusMessage: "Image introuvable dans le contenu de la série.",
    })
  }

  const nextRaw = matter.stringify(file.parsed.content, frontmatter, {
    language: "yaml",
    engines: {
      yaml: {
        parse: yaml.parse,
        stringify: serializeFrontmatter,
      },
    },
  })

  await fs.writeFile(file.absolutePath, nextRaw)

  return {
    ok: true,
    slug: normalizedSlug,
    removedSrc: normalizedSrc,
    remainingCount: remainingImageSources.length,
    filePath: file.absolutePath,
  }
}
