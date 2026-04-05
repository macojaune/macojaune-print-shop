import {
  DEFAULT_ASSET_BASE_URL,
  DEFAULT_SITE_URL,
  toAssetUrl,
  toSiteUrl,
} from '~~/lib/asset-url'

export const useAssetUrls = () => {
  const config = useRuntimeConfig()
  const siteUrl = config.public.siteUrl || DEFAULT_SITE_URL
  const assetBaseUrl = config.public.assetBaseUrl || DEFAULT_ASSET_BASE_URL

  return {
    assetBaseUrl,
    siteUrl,
    toAssetUrl: (value?: string | null) => toAssetUrl(value, assetBaseUrl, siteUrl),
    toSiteUrl: (value?: string | null) => toSiteUrl(value, siteUrl),
  }
}
