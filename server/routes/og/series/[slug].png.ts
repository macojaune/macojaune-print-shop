import { queryCollection } from "@nuxt/content/server"
import { getSeriesGalleryTiles, getSeriesHeroImage, getRunImageUrl } from "../../../../app/utils/runs"
import { toAbsoluteUrl } from "../../../../app/utils/run-media"
import { createSocialCard, pickStableItem } from "../../../utils/og-images"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") || ""
  const entries = await queryCollection(event, "runs").all()
  const serie = entries.find((entry) => String(entry.slug || "") === slug)

  if (!serie) {
    throw createError({ statusCode: 404, statusMessage: "Série introuvable" })
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
