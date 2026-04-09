import { queryCollection } from "@nuxt/content/server"
import { getProjectImageUrl, getProjectImages } from "../../../../app/utils/projects"
import { createSocialCard, pickStableItem } from "../../../utils/og-images"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug") || ""
  const entries = await queryCollection(event, "projects").all()
  const project = entries.find((entry) => String(entry.permalink || "") === slug)

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Projet introuvable" })
  }

  const images = getProjectImages(project)
  const chosenImage = pickStableItem(images, slug)
  const imageUrl = getProjectImageUrl(chosenImage)
  const description = typeof project.description === "string" && project.description.trim()
    ? project.description.trim()
    : `Découvre le projet ${project.title} sur Macojaune.`

  const png = await createSocialCard({
    eyebrow: "Projet photo",
    title: String(project.title || "Macojaune"),
    description,
    imageUrl,
  })

  setHeader(event, "content-type", "image/png")
  setHeader(event, "cache-control", "public, max-age=3600, s-maxage=86400")
  return png
})
