import { toAssetUrl } from "../../lib/asset-url"

type ContentNode = {
  children?: ContentNode[]
  props?: Record<string, unknown>
  tag?: string
}

type ContentProduct = Record<string, unknown> & {
  images?: string[]
}

type ContentFile = Record<string, unknown> & {
  body?: ContentNode
  cover?: string
  image?: string
  images?: string[]
  products?: ContentProduct[]
}

const defaultSiteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://macojaune.com"
const defaultAssetBaseUrl = process.env.NUXT_PUBLIC_ASSET_BASE_URL || "https://cdn.macojaune.com"

const visit = (node: ContentNode | undefined, callback: (currentNode: ContentNode) => void) => {
  if (!node) {
    return
  }

  callback(node)

  if (!Array.isArray(node.children)) {
    return
  }

  for (const child of node.children) {
    visit(child, callback)
  }
}

const rewriteMaybeAsset = (value: unknown) => {
  return typeof value === "string"
    ? toAssetUrl(value, defaultAssetBaseUrl, defaultSiteUrl)
    : value
}

const rewriteMaybeAssetList = (value: unknown) => {
  if (!Array.isArray(value)) {
    return value
  }

  return value.map((entry) => rewriteMaybeAsset(entry))
}

const rewriteSrcset = (value: string) => {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [url, descriptor] = entry.split(/\s+/, 2)
      const rewrittenUrl = typeof url === "string" && url.startsWith("/pictures/")
        ? toAssetUrl(url, defaultAssetBaseUrl, defaultSiteUrl)
        : url

      return descriptor ? `${rewrittenUrl} ${descriptor}` : rewrittenUrl
    })
    .join(", ")
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("content:file:afterParse", (file: ContentFile) => {
    file.image = rewriteMaybeAsset(file.image) as string | undefined
    file.cover = rewriteMaybeAsset(file.cover) as string | undefined
    file.images = rewriteMaybeAssetList(file.images) as string[] | undefined

    if (Array.isArray(file.products)) {
      file.products = file.products.map((product) => ({
        ...product,
        images: rewriteMaybeAssetList(product.images) as string[] | undefined,
      }))
    }

    visit(file.body, (node) => {
      if (!node.props) {
        return
      }

      const src = node.props.src
      if (typeof src === "string" && src.startsWith("/pictures/")) {
        node.props.src = toAssetUrl(src, defaultAssetBaseUrl, defaultSiteUrl)
      }

      const srcset = node.props.srcset
      if (typeof srcset === "string" && srcset.includes("/pictures/")) {
        node.props.srcset = rewriteSrcset(srcset)
      }
    })
  })
})
