export const buildSiteOgImagePath = (options: {
  title: string
  eyebrow?: string
  description?: string
  image?: string
}) => {
  const params = new URLSearchParams()

  params.set("title", options.title)

  if (options.eyebrow) {
    params.set("eyebrow", options.eyebrow)
  }

  if (options.description) {
    params.set("description", options.description)
  }

  if (options.image) {
    params.set("image", options.image)
  }

  return `/og/site.png?${params.toString()}`
}

export const buildSeriesOgImagePath = (slug?: string | null) =>
  `/og/series/${encodeURIComponent((slug || "").trim())}.png`

export const buildProjectOgImagePath = (slug?: string | null) =>
  `/og/projects/${encodeURIComponent((slug || "").trim())}.png`
