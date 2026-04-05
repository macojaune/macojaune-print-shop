export const RUN_MEDIA_PREFIX = "/media/runs/"

export function isAbsoluteUrl(value: string | undefined) {
  return /^https?:\/\//i.test(value || "")
}

export function getRunMediaAssetId(value: string | undefined) {
  if (!value?.startsWith(RUN_MEDIA_PREFIX)) {
    return null
  }

  const assetId = value.slice(RUN_MEDIA_PREFIX.length).replace(/^\/+|\/+$/g, "")
  return assetId || null
}

export function toAbsoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value) {
    return ""
  }

  if (isAbsoluteUrl(value)) {
    return value
  }

  return new URL(value, baseUrl).toString()
}
