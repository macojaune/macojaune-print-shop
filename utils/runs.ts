import { runImageManifest } from "../generated/run-image-manifest"
import { isAbsoluteUrl } from "./run-media"

type GalleryImage = {
  src?: string
  alt?: string
  caption?: string
  orientation?: string
}

type RunImageFormat = "avif" | "webp"
export type RunImageVariantName = "thumb" | "card" | "detail" | "social"

type ManifestVariant = {
  avif?: { src: string; width: number; height: number }[]
  webp?: { src: string; width: number; height: number }[]
}

type ProductLike = {
  title?: string
  heroImage?: string
  images?: string[]
  gallery?: GalleryImage[]
}

type RunLike = {
  title?: string
  coverImage?: string
  heroImage?: string
  products?: ProductLike[]
  gallery?: GalleryImage[]
}

export function slugifyRunValue(value: string | undefined) {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
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
  format: RunImageFormat = "webp",
) {
  const variantEntry = getVariantEntry(src, variant)
  const derivedSource = variantEntry?.[format]?.[variantEntry[format].length - 1]?.src

  return derivedSource || src || ""
}

export function isAbsoluteImageUrl(src: string | undefined) {
  return isAbsoluteUrl(src)
}

export function getRunImageSrcSet(
  src: string | undefined,
  variant: RunImageVariantName = "detail",
  format: RunImageFormat = "webp",
) {
  const variantEntry = getVariantEntry(src, variant)

  if (!variantEntry?.[format]?.length) {
    return ""
  }

  return variantEntry[format].map((entry) => `${entry.src} ${entry.width}w`).join(", ")
}

export function getRunImageDimensions(
  src: string | undefined,
  variant: RunImageVariantName = "detail",
) {
  const variantEntry = getVariantEntry(src, variant)
  const fallbackEntry = variantEntry?.webp?.[variantEntry.webp.length - 1] || variantEntry?.avif?.[variantEntry.avif.length - 1]

  return {
    width: fallbackEntry?.width,
    height: fallbackEntry?.height,
  }
}
