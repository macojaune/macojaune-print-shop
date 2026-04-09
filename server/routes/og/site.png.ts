import { createSocialCard } from "../../utils/og-images"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const title = typeof query.title === "string" && query.title.trim()
    ? query.title.trim()
    : "Macojaune"
  const eyebrow = typeof query.eyebrow === "string" && query.eyebrow.trim()
    ? query.eyebrow.trim()
    : "Macojaune"
  const description = typeof query.description === "string" && query.description.trim()
    ? query.description.trim()
    : "Photographie, séries, projets et expérimentations visuelles."
  const image = typeof query.image === "string" && query.image.trim()
    ? query.image.trim()
    : "/pictures/dsc06261.jpg"

  const png = await createSocialCard({
    title,
    eyebrow,
    description,
    imageUrl: image,
  })

  setHeader(event, "content-type", "image/png")
  setHeader(event, "cache-control", "public, max-age=3600, s-maxage=86400")
  return png
})
