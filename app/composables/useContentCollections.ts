import type { QueryBuilderParams } from '@nuxt/content/types'
import { toAssetUrl } from '~~/lib/asset-url'

type ContentValue = string | number | boolean | null | undefined | ContentRecord | ContentValue[]
type ContentRecord = Record<string, ContentValue>
type ContentNode = {
  children?: ContentNode[]
  props?: Record<string, unknown>
}

type CollectionName = 'blog' | 'projects' | 'mentions' | 'runs' | 'links'

const collectionFromPath = (value?: string): CollectionName | null => {
  if (!value) return null

  const normalized = value.replace(/^\/+|\/+$/g, '')
  if (!normalized) return null

  const [root] = normalized.split('/')
  if (root === 'blog' || root === 'projects' || root === 'mentions' || root === 'runs' || root === 'links') {
    return root
  }

  return null
}

export const normalizeContentSlug = (value?: string | null) =>
  (value || '').trim().replace(/^\/+|\/+$/g, '')

const toTimestamp = (value: unknown) => {
  if (!value) return 0
  const timestamp = new Date(String(value)).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

const isContentRecord = (value: unknown): value is ContentRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const parseMaybeJson = (value: unknown) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()
  if (!(trimmedValue.startsWith('{') || trimmedValue.startsWith('['))) {
    return value
  }

  try {
    return JSON.parse(trimmedValue) as ContentValue
  } catch {
    return value
  }
}

const hydrateContentEntry = <T extends ContentRecord>(entry: T) => {
  const meta = parseMaybeJson(entry.meta)
  const body = parseMaybeJson(entry.body)
  const seo = parseMaybeJson(entry.seo)

  return {
    ...entry,
    ...(isContentRecord(meta) ? rewriteEntryAssets(meta) : {}),
    body: rewriteContentBody(body),
    seo,
  }
}

const rewriteMaybeAsset = (value: unknown) =>
  typeof value === 'string' ? toAssetUrl(value) : value

const rewriteMaybeAssetList = (value: unknown) =>
  Array.isArray(value) ? value.map((entry) => rewriteMaybeAsset(entry)) : value

const rewriteMaybeGallery = (value: unknown) => {
  if (!Array.isArray(value)) {
    return value
  }

  return value.map((entry) => {
    if (!isContentRecord(entry)) {
      return entry
    }

    return {
      ...entry,
      src: rewriteMaybeAsset(entry.src),
    }
  })
}

const rewriteContentNode = (node: ContentNode | undefined) => {
  if (!node) {
    return node
  }

  if (node.props) {
    const src = node.props.src
    if (typeof src === 'string') {
      node.props.src = toAssetUrl(src)
    }

    const srcset = node.props.srcset
    if (typeof srcset === 'string') {
      node.props.srcset = srcset
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => {
          const [url, descriptor] = entry.split(/\s+/, 2)
          const rewrittenUrl = toAssetUrl(url)
          return descriptor ? `${rewrittenUrl} ${descriptor}` : rewrittenUrl
        })
        .join(', ')
    }
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => rewriteContentNode(child))
  }

  return node
}

const rewriteContentBody = (value: unknown) => {
  if (!isContentRecord(value)) {
    return value
  }

  const clonedBody = structuredClone(value) as ContentNode
  return rewriteContentNode(clonedBody)
}

const rewriteEntryAssets = (entry: ContentRecord) => {
  const rewrittenEntry: ContentRecord = {
    ...entry,
    image: rewriteMaybeAsset(entry.image),
    cover: rewriteMaybeAsset(entry.cover),
    coverImage: rewriteMaybeAsset(entry.coverImage),
    heroImage: rewriteMaybeAsset(entry.heroImage),
    images: rewriteMaybeAssetList(entry.images),
    gallery: rewriteMaybeGallery(entry.gallery),
  }

  if (Array.isArray(entry.storyBlocks)) {
    rewrittenEntry.storyBlocks = entry.storyBlocks.map((block) =>
      isContentRecord(block)
        ? {
            ...block,
            image: rewriteMaybeAsset(block.image),
          }
        : block,
    )
  }

  if (Array.isArray(entry.products)) {
    rewrittenEntry.products = entry.products.map((product) =>
      isContentRecord(product)
        ? {
            ...product,
            heroImage: rewriteMaybeAsset(product.heroImage),
            images: rewriteMaybeAssetList(product.images),
            gallery: rewriteMaybeGallery(product.gallery),
          }
        : product,
    )
  }

  return rewrittenEntry
}

const normalizeBlogEntry = <T extends ContentRecord>(entry: T) => {
  const hydratedEntry = hydrateContentEntry(entry)

  return {
    ...hydratedEntry,
    permalink: normalizeContentSlug(hydratedEntry.permalink),
    date: hydratedEntry.date || hydratedEntry.createdAt || null,
    updatedAt: hydratedEntry.updatedAt || null,
    draft: Boolean(hydratedEntry.draft ?? hydratedEntry.isDraft),
  }
}

const normalizeProjectEntry = <T extends ContentRecord>(entry: T) => {
  const hydratedEntry = hydrateContentEntry(entry)

  return {
    ...hydratedEntry,
    permalink: normalizeContentSlug(hydratedEntry.permalink),
    date: hydratedEntry.date || null,
    updatedAt: hydratedEntry.updatedAt || null,
    draft: Boolean(hydratedEntry.draft),
  }
}

const normalizeRunEntry = <T extends ContentRecord>(entry: T) => {
  const hydratedEntry = hydrateContentEntry(entry)

  return {
    ...hydratedEntry,
    slug: normalizeContentSlug(hydratedEntry.slug),
    date: hydratedEntry.date || null,
  }
}

const normalizeMentionEntry = <T extends ContentRecord>(entry: T) => {
  const hydratedEntry = hydrateContentEntry(entry)

  return {
    ...hydratedEntry,
    slug: normalizeContentSlug(hydratedEntry.slug),
  }
}

const sortByNewest = <T extends ContentRecord>(entries: T[]) =>
  [...entries].sort((left, right) => toTimestamp(right.date || right.createdAt) - toTimestamp(left.date || left.createdAt))

export async function getBlogEntries() {
  const entries = (await queryCollection('blog').all()) as ContentRecord[]
  return sortByNewest(entries.map(normalizeBlogEntry).filter((entry) => !entry.draft))
}

export async function getProjectEntries() {
  const entries = (await queryCollection('projects').all()) as ContentRecord[]
  return sortByNewest(entries.map(normalizeProjectEntry).filter((entry) => !entry.draft))
}

export async function getRunEntries() {
  const entries = (await queryCollection('runs').all()) as ContentRecord[]
  return sortByNewest(entries.map(normalizeRunEntry))
}

export async function getMentionEntries() {
  const entries = (await queryCollection('mentions').all()) as ContentRecord[]
  return entries.map(normalizeMentionEntry)
}

export async function getLinksEntries() {
  return (await queryCollection('links').all()) as ContentRecord[]
}

export async function findBlogEntryByPermalink(permalink?: string | null) {
  const normalizedPermalink = normalizeContentSlug(permalink)
  if (!normalizedPermalink) return null

  const entries = await getBlogEntries()
  return entries.find((entry) => normalizeContentSlug(entry.permalink) === normalizedPermalink) ?? null
}

export async function findNextBlogEntry(date?: string | null) {
  if (!date) return null

  const referenceTimestamp = toTimestamp(date)
  if (!referenceTimestamp) return null

  const entries = await getBlogEntries()
  return entries.find((entry) => {
    const entryTimestamp = toTimestamp(entry.date || entry.createdAt)
    return entryTimestamp > 0 && entryTimestamp < referenceTimestamp
  }) ?? null
}

export async function findProjectEntryByPermalink(permalink?: string | null) {
  const normalizedPermalink = normalizeContentSlug(permalink)
  if (!normalizedPermalink) return null

  const entries = await getProjectEntries()
  return entries.find((entry) => normalizeContentSlug(entry.permalink) === normalizedPermalink) ?? null
}

export async function findMentionEntryBySlug(slug?: string | null) {
  const normalizedSlug = normalizeContentSlug(slug)
  if (!normalizedSlug) return null

  const entries = await getMentionEntries()
  return entries.find((entry) => normalizeContentSlug(entry.slug) === normalizedSlug) ?? null
}

export async function findRunEntryBySlug(slug?: string | null) {
  const normalizedSlug = normalizeContentSlug(slug)
  if (!normalizedSlug) return null

  const entries = await getRunEntries()
  return entries.find((entry) => normalizeContentSlug(entry.slug) === normalizedSlug) ?? null
}

const sortEntries = (entries: ContentRecord[], sort?: QueryBuilderParams['sort']) => {
  if (!sort) return entries

  const sortList = Array.isArray(sort) ? sort : [sort]
  const [sortEntry] = sortList
  if (!sortEntry) return entries

  const { date, _id } = sortEntry
  const direction = Number(date ?? _id ?? -1)

  return [...entries].sort((left, right) => {
    const leftValue = toTimestamp(left.date || left.createdAt || left._id)
    const rightValue = toTimestamp(right.date || right.createdAt || right._id)
    return direction >= 0 ? leftValue - rightValue : rightValue - leftValue
  })
}

const matchesCondition = (entryValue: unknown, expectedValue: unknown, field: string) => {
  if (expectedValue && typeof expectedValue === 'object' && !Array.isArray(expectedValue)) {
    const operatorValue = expectedValue as Record<string, unknown>

    if ('$eq' in operatorValue) {
      return matchesCondition(entryValue, operatorValue.$eq, field)
    }

    if ('$lt' in operatorValue) {
      return toTimestamp(entryValue) < toTimestamp(operatorValue.$lt)
    }
  }

  if (field === 'permalink' || field === 'slug') {
    return normalizeContentSlug(String(entryValue || '')) === normalizeContentSlug(String(expectedValue || ''))
  }

  return entryValue === expectedValue
}

const applyWhere = (entries: ContentRecord[], where?: QueryBuilderParams['where']) => {
  if (!where) return entries

  const conditions = Array.isArray(where) ? where : [where]

  return entries.filter((entry) =>
    conditions.every((condition) =>
      Object.entries(condition).every(([field, value]) => matchesCondition(entry[field], value, field)),
    ),
  )
}

const applyPagination = (entries: ContentRecord[], query: QueryBuilderParams = {}) => {
  const skip = Number(query.skip || 0)
  const limit = query.limit ? Number(query.limit) : null
  const paged = skip > 0 ? entries.slice(skip) : entries
  return limit ? paged.slice(0, limit) : paged
}

export async function listContentEntries(query: QueryBuilderParams = {}) {
  const collection = collectionFromPath(query.path)

  let entries: ContentRecord[] = []
  switch (collection) {
    case 'blog':
      entries = await getBlogEntries()
      break
    case 'projects':
      entries = await getProjectEntries()
      break
    case 'runs':
      entries = await getRunEntries()
      break
    case 'mentions':
      entries = await getMentionEntries()
      break
    case 'links':
      entries = await getLinksEntries()
      break
    default:
      entries = []
  }

  return applyPagination(sortEntries(applyWhere(entries, query.where), query.sort), query)
}

export async function findContentDocumentByPath(path: string) {
  const collection = collectionFromPath(path)
  const slug = normalizeContentSlug(path.split('/').slice(1).join('/'))

  switch (collection) {
    case 'mentions': {
      const entries = await getMentionEntries()
      return entries.find((entry) => normalizeContentSlug(entry.slug) === slug) ?? null
    }
    case 'blog': {
      const entries = await getBlogEntries()
      return entries.find((entry) => normalizeContentSlug(entry.permalink) === normalizeContentSlug(path.split('/').slice(1).join('/'))) ?? null
    }
    case 'projects': {
      const entries = await getProjectEntries()
      return entries.find((entry) => normalizeContentSlug(entry.permalink) === normalizeContentSlug(path.split('/').slice(1).join('/'))) ?? null
    }
    case 'runs': {
      const entries = await getRunEntries()
      return entries.find((entry) => normalizeContentSlug(entry.slug) === normalizeContentSlug(path.split('/').slice(1).join('/'))) ?? null
    }
    default:
      return null
  }
}
