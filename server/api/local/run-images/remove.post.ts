import { removeRunImageFromContent } from "../../../utils/local-run-image-curation"

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({
      statusCode: 404,
      statusMessage: "Not found",
    })
  }

  const body = await readBody<{ slug?: string, src?: string }>(event)
  return removeRunImageFromContent(String(body?.slug || ""), String(body?.src || ""))
})
