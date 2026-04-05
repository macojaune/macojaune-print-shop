export const DEFAULT_SITE_URL = "https://macojaune.com"
export const DEFAULT_ASSET_BASE_URL = "https://cdn.macojaune.com"

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "")
const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value)
const isProtocolRelativeUrl = (value: string) => value.startsWith("//")

const splitPathAndSuffix = (value: string) => {
  const match = value.match(/^([^?#]*)(.*)$/)

  return {
    pathname: match?.[1] ?? value,
    suffix: match?.[2] ?? "",
  }
}

export const normalizePath = (value: string) => {
  const { pathname, suffix } = splitPathAndSuffix(value.trim())
  const normalizedPath = `/${pathname.replace(/^\/+/, "").replace(/\/{2,}/g, "/")}`

  return `${normalizedPath}${suffix}`
}

export const toSiteUrl = (
  value?: string | null,
  siteUrl = DEFAULT_SITE_URL,
) => {
  const baseUrl = stripTrailingSlash(siteUrl || DEFAULT_SITE_URL)

  if (!value) {
    return baseUrl
  }

  const trimmedValue = value.trim()

  if (isAbsoluteHttpUrl(trimmedValue)) {
    return trimmedValue
  }

  if (isProtocolRelativeUrl(trimmedValue)) {
    return `https:${trimmedValue}`
  }

  return `${baseUrl}${normalizePath(trimmedValue)}`
}

export const toAssetUrl = (
  value?: string | null,
  assetBaseUrl = DEFAULT_ASSET_BASE_URL,
  siteUrl = DEFAULT_SITE_URL,
) => {
  if (!value) {
    return ""
  }

  const trimmedValue = value.trim()

  if (isAbsoluteHttpUrl(trimmedValue)) {
    return trimmedValue
  }

  if (isProtocolRelativeUrl(trimmedValue)) {
    return `https:${trimmedValue}`
  }

  const normalizedPath = normalizePath(
    trimmedValue.startsWith("/") || trimmedValue.startsWith("pictures/")
      ? trimmedValue
      : `pictures/${trimmedValue}`,
  )

  if (normalizedPath.startsWith("/media/")) {
    return normalizedPath
  }

  if (normalizedPath.startsWith("/pictures/")) {
    return `${stripTrailingSlash(assetBaseUrl || DEFAULT_ASSET_BASE_URL)}${normalizedPath}`
  }

  return `${stripTrailingSlash(siteUrl || DEFAULT_SITE_URL)}${normalizedPath}`
}
