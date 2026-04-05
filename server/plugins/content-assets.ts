import { toAssetUrl } from "../../lib/asset-url"

type ContentNode = {
  children?: ContentNode[]
  props?: Record<string, unknown>
  tag?: string
}

type ContentProduct = Record<string, unknown> & {
  gallery?: ContentGalleryImage[]
  heroImage?: string
  images?: string[]
}

type ContentGalleryImage = Record<string, unknown> & {
  src?: string
}

type ContentFile = Record<string, unknown> & {
  body?: ContentNode
  cover?: string
  coverImage?: string
  gallery?: ContentGalleryImage[]
  heroImage?: string
  image?: string
  images?: string[]
  products?: ContentProduct[]
  storyBlocks?: Array<Record<string, unknown> & { image?: string }>
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

const rewriteMaybeGallery = (value: unknown) => {
  if (!Array.isArray(value)) {
    return value
  }

  return value.map((entry) => {
    if (!entry || typeof entry !== "object") {
      return entry
    }

    return {
      ...entry,
      src: rewriteMaybeAsset((entry as ContentGalleryImage).src),
    }
  })
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
    file.coverImage = rewriteMaybeAsset(file.coverImage) as string | undefined
    file.heroImage = rewriteMaybeAsset(file.heroImage) as string | undefined
    file.images = rewriteMaybeAssetList(file.images) as string[] | undefined
    file.gallery = rewriteMaybeGallery(file.gallery) as ContentGalleryImage[] | undefined

    if (Array.isArray(file.storyBlocks)) {
      file.storyBlocks = file.storyBlocks.map((block) => ({
        ...block,
        image: rewriteMaybeAsset(block.image) as string | undefined,
      }))
    }

    if (Array.isArray(file.products)) {
      file.products = file.products.map((product) => ({
        ...product,
        heroImage: rewriteMaybeAsset(product.heroImage) as string | undefined,
        gallery: rewriteMaybeGallery(product.gallery) as ContentGalleryImage[] | undefined,
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
