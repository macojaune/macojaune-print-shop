import { queryCollection } from "@nuxt/content/server"
import type { H3Event } from "h3"
import { getSeriesGalleryTiles, getSeriesHeroImage, getRunImageUrl } from "../../../../app/utils/runs"
import { toAbsoluteUrl } from "../../../../app/utils/run-media"
import { createSocialCard, pickStableItem } from "../../../utils/og-images"

type CollectionEntry = Record<string, unknown> & {
  meta?: Record<string, unknown>
}

const getPngRouteSlug = (event: H3Event) => {
  const pathname = getRequestURL(event).pathname
  const pathMatch = pathname.match(/^\/og\/series\/(.+)\.png$/)
  const rawSlug = getRouterParam(event, "slug") || pathMatch?.[1] || ""

  return decodeURIComponent(rawSlug).replace(/\.png$/, "").trim()
}

const normalizeRunEntry = (entry: CollectionEntry) => {
  const meta = entry.meta || {}

  return {
    ...entry,
    ...meta,
    title: entry.title || meta.title,
    description: entry.description || meta.description,
    slug: String(entry.slug || meta.slug || ""),
  }
}

const getRunBySlug = async (event: H3Event, slug: string) => {
  const directEntry = await queryCollection(event, "runs")
    .where("stem", "=", `runs/${slug}`)
    .first()

  const normalizedDirectEntry = directEntry ? normalizeRunEntry(directEntry) : null
  if (normalizedDirectEntry?.slug === slug) {
    return normalizedDirectEntry
  }

  const pathEntry = await queryCollection(event, "runs").path(`/runs/${slug}`).first()
  const normalizedPathEntry = pathEntry ? normalizeRunEntry(pathEntry) : null
  if (normalizedPathEntry?.slug === slug) {
    return normalizedPathEntry
  }

  const entries = await queryCollection(event, "runs")
    .select("title", "description", "meta", "path", "stem")
    .all()

  return entries.map((entry) => normalizeRunEntry(entry)).find((entry) => entry.slug === slug)
}

export default defineEventHandler(async (event) => {
  const slug = getPngRouteSlug(event)
  const serie = await getRunBySlug(event, slug)

  if (!serie) {
    throw createError({ statusCode: 404, message: "Série introuvable" })
  }

  const tiles = getSeriesGalleryTiles(serie)
  const chosenTile = pickStableItem(tiles, slug)
  const fallbackImage = getSeriesHeroImage(serie)
  const imageUrl = toAbsoluteUrl(
    getRunImageUrl(chosenTile?.src || fallbackImage, "social") || chosenTile?.src || fallbackImage,
    "https://macojaune.com",
  )
  const description = typeof serie.description === "string" && serie.description.trim()
    ? serie.description.trim()
    : `Découvre la série photo ${serie.title} sur Macojaune.`

  const png = await createSocialCard({
    eyebrow: "Série photo",
    title: String(serie.title || "Macojaune"),
    description,
    imageUrl,
  })

  setHeader(event, "content-type", "image/png")
  setHeader(event, "cache-control", "public, max-age=3600, s-maxage=86400")
  return png
})
