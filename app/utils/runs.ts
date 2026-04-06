import { runImageManifest } from "../../generated/run-image-manifest"
import { isAbsoluteUrl } from "./run-media"

type GalleryImage = {
  src?: string
  alt?: string
  caption?: string
  orientation?: string
  sensitive?: boolean
}

export type SeriesGalleryTile = {
  src: string
  alt: string
  caption?: string
  orientation?: string
  productSlug?: string
  productTitle?: string
  sensitive?: boolean
}

export type RunImageVariantName = "thumb" | "card" | "detail" | "social"

type ManifestVariant = {
  webp?: { src: string; width: number; height: number }[]
}

export type ProductLike = {
  title?: string
  slug?: string
  heroImage?: string
  images?: string[]
  gallery?: GalleryImage[]
}

export type RunLike = {
  title?: string
  slug?: string
  coverImage?: string
  heroImage?: string
  products?: ProductLike[]
  gallery?: GalleryImage[]
  sensitiveImages?: string[]
}

export function slugifyRunValue(value: string | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
}

function normalizeImageSourceForMatch(value: string | undefined) {
  if (!value) {
    return ""
  }

  let normalized = value.trim()
  if (!normalized) {
    return ""
  }

  if (isAbsoluteUrl(normalized)) {
    try {
      normalized = new URL(normalized).pathname
    } catch {
      // Keep the original value if URL parsing fails.
    }
  }

  return normalized
}

export function getGallerySources(gallery?: GalleryImage[]) {
  return (gallery || [])
    .map((image) => image?.src)
    .filter((src): src is string => Boolean(src))
}

export function getProductImages(product?: ProductLike) {
  const gallerySources = getGallerySources(product?.gallery)

  if (gallerySources.length > 0) {
    return gallerySources
  }

  return (product?.images || []).filter((src): src is string => Boolean(src))
}

export function getProductHeroImage(product?: ProductLike) {
  return product?.heroImage || getProductImages(product)[0] || ""
}

function dedupeSeriesGalleryTiles(tiles: SeriesGalleryTile[]) {
  const seen = new Set<string>()

  return tiles.filter((tile) => {
    if (!tile.src || seen.has(tile.src)) {
      return false
    }

    seen.add(tile.src)
    return true
  })
}

export function getSeriesGalleryTiles(run?: RunLike) {
  if (!run) {
    return []
  }

  const sensitiveSources = new Set(
    (run.sensitiveImages || [])
      .map((entry) => normalizeImageSourceForMatch(entry))
      .filter(Boolean),
  )

  const productTiles = (run.products || []).flatMap((product) => {
    const galleryTiles = (product.gallery || [])
      .map((image) => ({
        src: image?.src || "",
        alt: image?.alt || product.title || run.title || "",
        caption: image?.caption || "",
        orientation: image?.orientation,
        productSlug: product.slug,
        productTitle: product.title,
        sensitive:
          Boolean(image?.sensitive) ||
          sensitiveSources.has(normalizeImageSourceForMatch(image?.src || "")),
      }))
      .filter((tile): tile is SeriesGalleryTile => Boolean(tile.src))

    if (galleryTiles.length > 0) {
      return galleryTiles
    }

    return getProductImages(product).map((src) => ({
      src,
      alt: product.title || run.title || "",
      productSlug: product.slug,
      productTitle: product.title,
      sensitive: sensitiveSources.has(normalizeImageSourceForMatch(src)),
    }))
  })

  if (productTiles.length > 0) {
    return dedupeSeriesGalleryTiles(productTiles)
  }

  const runGalleryTiles = (run.gallery || [])
    .map((image) => ({
      src: image?.src || "",
      alt: image?.alt || run.title || "",
      caption: image?.caption || "",
      orientation: image?.orientation,
      sensitive:
        Boolean(image?.sensitive) ||
        sensitiveSources.has(normalizeImageSourceForMatch(image?.src || "")),
    }))
    .filter((tile): tile is SeriesGalleryTile => Boolean(tile.src))

  return dedupeSeriesGalleryTiles(runGalleryTiles)
}

export function getSeriesCoverImage(run?: RunLike) {
  if (!run) {
    return ""
  }

  return (
    run.coverImage ||
    run.heroImage ||
    getGallerySources(run.gallery)[0] ||
    getProductHeroImage(run.products?.[0]) ||
    ""
  )
}

export function getSeriesHeroImage(run?: RunLike) {
  return run?.heroImage || getSeriesCoverImage(run)
}

function getVariantEntry(
  src: string | undefined,
  variant: RunImageVariantName,
): ManifestVariant | undefined {
  if (!src) {
    return undefined
  }

  const manifestEntry = runImageManifest[src as keyof typeof runImageManifest]

  if (!manifestEntry) {
    return undefined
  }

  const variantMap = {
    thumb: manifestEntry.thumb,
    card: manifestEntry.card,
    detail: manifestEntry.detail,
    social: manifestEntry.social,
  }

  return variantMap[variant]
}

export function getRunImageUrl(
  src: string | undefined,
  variant: RunImageVariantName = "detail",
) {
  const variantEntry = getVariantEntry(src, variant)
  const derivedSource = variantEntry?.webp?.[variantEntry.webp.length - 1]?.src

  return derivedSource || src || ""
}

export function isAbsoluteImageUrl(src: string | undefined) {
  return isAbsoluteUrl(src)
}

export function getRunImageSrcSet(
  src: string | undefined,
  variant: RunImageVariantName = "detail",
) {
  const variantEntry = getVariantEntry(src, variant)

  if (!variantEntry?.webp?.length) {
    return ""
  }

  return variantEntry.webp.map((entry) => `${entry.src} ${entry.width}w`).join(", ")
}

export function getRunImageDimensions(
  src: string | undefined,
  variant: RunImageVariantName = "detail",
) {
  const variantEntry = getVariantEntry(src, variant)
  const fallbackEntry = variantEntry?.webp?.[variantEntry.webp.length - 1]

  return {
    width: fallbackEntry?.width,
    height: fallbackEntry?.height,
  }
}
