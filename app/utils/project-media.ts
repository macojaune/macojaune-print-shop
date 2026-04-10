export const PROJECT_MEDIA_PREFIX = "/media/projects/"

export function isAbsoluteProjectUrl(value: string | undefined) {
  return /^https?:\/\//i.test(value || "")
}

export function getProjectMediaAssetId(value: string | undefined) {
  if (!value?.startsWith(PROJECT_MEDIA_PREFIX)) {
    return null
  }

  const assetId = value.slice(PROJECT_MEDIA_PREFIX.length).replace(/^\/+|\/+$/g, "")
  return assetId || null
}
