import { createError, defineEventHandler, readMultipartFormData } from "h3"

import { createR2ImageAsset } from "../../utils/r2-images"

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)

  if (!parts) {
    throw createError({
      statusCode: 400,
      statusMessage: "Expected multipart form data.",
    })
  }

  const filePart = parts.find((part) => part.name === "file" && part.data)
  const directoryPart = parts.find((part) => part.name === "directory")

  if (!filePart?.filename || !filePart.data) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing uploaded file.",
    })
  }

  const manifest = await createR2ImageAsset(
    {
      filename: filePart.filename,
      type: filePart.type,
      data: filePart.data,
    },
    directoryPart?.data?.toString("utf8"),
  )

  return {
    id: manifest.assetId,
    type: "file",
    filename: manifest.filename,
    directory: manifest.assetId.includes("/") ? manifest.assetId.split("/").slice(0, -1).join("/") : "",
    src: manifest.src,
    thumbnails: {
      "75x75": manifest.thumb.webp[0]?.src || manifest.previewSrc,
      "400x400": manifest.card.webp[0]?.src || manifest.previewSrc,
      "1000x1000": manifest.previewSrc,
    },
  }
})
