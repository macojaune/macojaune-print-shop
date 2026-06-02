import { queryCollection } from "@nuxt/content/server"
import type { H3Event } from "h3"
import { getProjectImageUrl, getProjectImages } from "../../../../app/utils/projects"
import { createSocialCard, pickStableItem } from "../../../utils/og-images"

type CollectionEntry = Record<string, unknown> & {
  meta?: Record<string, unknown>
}

const getPngRouteSlug = (event: H3Event) => {
  const pathname = getRequestURL(event).pathname
  const pathMatch = pathname.match(/^\/og\/projects\/(.+)\.png$/)
  const rawSlug = getRouterParam(event, "slug") || pathMatch?.[1] || ""

  return decodeURIComponent(rawSlug).replace(/\.png$/, "").trim()
}

const normalizeProjectEntry = (entry: CollectionEntry) => {
  const meta = entry.meta || {}

  return {
    ...entry,
    ...meta,
    title: entry.title || meta.title,
    description: entry.description || meta.description,
    permalink: String(entry.permalink || meta.permalink || ""),
  }
}

const getProjectBySlug = async (event: H3Event, slug: string) => {
  const directEntry = await queryCollection(event, "projects")
    .where("stem", "=", `projects/${slug}`)
    .first()

  const normalizedDirectEntry = directEntry ? normalizeProjectEntry(directEntry) : null
  if (normalizedDirectEntry?.permalink === slug) {
    return normalizedDirectEntry
  }

  const pathEntry = await queryCollection(event, "projects").path(`/projects/${slug}`).first()
  const normalizedPathEntry = pathEntry ? normalizeProjectEntry(pathEntry) : null
  if (normalizedPathEntry?.permalink === slug) {
    return normalizedPathEntry
  }

  const entries = await queryCollection(event, "projects")
    .select("title", "description", "meta", "path", "stem")
    .all()

  return entries.map((entry) => normalizeProjectEntry(entry)).find((entry) => entry.permalink === slug)
}

export default defineEventHandler(async (event) => {
  const slug = getPngRouteSlug(event)
  const project = await getProjectBySlug(event, slug)

  if (!project) {
    throw createError({ statusCode: 404, message: "Projet introuvable" })
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
