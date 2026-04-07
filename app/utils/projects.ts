import { projectImageManifest } from "../../generated/project-image-manifest"
import { getProjectMediaAssetId, isAbsoluteUrl } from "./project-media"

export type ProjectLike = {
  image?: string | null
  images?: unknown
  projectStatus?: string | null
}

type ProjectImageEntry = {
  preview?: {
    src: string
    width: number
    height: number
  }
}

function normalizeProjectImageSource(value: string | undefined) {
  if (!value) {
    return ""
  }

  let normalizedValue = value.trim()
  if (!normalizedValue) {
    return ""
  }

  if (isAbsoluteUrl(normalizedValue)) {
    try {
      normalizedValue = new URL(normalizedValue).pathname || normalizedValue
    } catch {
      return normalizedValue
    }
  }

  for (let index = 0; index < 2; index += 1) {
    try {
      const decodedValue = decodeURIComponent(normalizedValue)

      if (decodedValue === normalizedValue) {
        break
      }

      normalizedValue = decodedValue
    } catch {
      break
    }
  }

  return normalizedValue
}

export const getProjectImages = (project?: ProjectLike | null) => {
  if (!project) {
    return []
  }

  if (Array.isArray(project.images)) {
    const images = project.images
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean)

    if (images.length) {
      return images
    }
  }

  if (typeof project.image === "string" && project.image.trim()) {
    return [project.image.trim()]
  }

  return []
}

export const getProjectPreviewImage = (project?: ProjectLike | null) => getProjectImages(project)[0] || ""

function getManifestEntry(src: string | undefined): ProjectImageEntry | undefined {
  const normalizedSrc = normalizeProjectImageSource(src)

  if (!normalizedSrc) {
    return undefined
  }

  return projectImageManifest[normalizedSrc as keyof typeof projectImageManifest]
}

export function getProjectImageUrl(src: string | undefined) {
  const manifestSrc = getManifestEntry(src)?.preview?.src

  return manifestSrc || src || ""
}

export function getProjectImageDimensions(src: string | undefined) {
  const preview = getManifestEntry(src)?.preview

  return {
    width: preview?.width,
    height: preview?.height,
  }
}

export function getProjectCanonicalImageUrl(src: string | undefined, siteUrl: string) {
  if (!src) {
    return ""
  }

  const assetId = getProjectMediaAssetId(src)
  if (!assetId) {
    return getProjectImageUrl(src)
  }

  return new URL(`/media/projects/${assetId}`, siteUrl).toString()
}

export function getProjectStatusLabel(status?: string | null) {
  switch (status) {
    case "started":
      return "En cours"
    default:
      return ""
  }
}
