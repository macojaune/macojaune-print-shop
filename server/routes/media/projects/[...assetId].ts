import { createError, defineEventHandler, getRouterParam, sendRedirect } from "h3"

import { getR2ProjectImageManifest } from "../../../utils/r2-project-images"

export default defineEventHandler(async (event) => {
  const assetId = getRouterParam(event, "assetId")

  if (!assetId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project image not found.",
    })
  }

  const manifest = await getR2ProjectImageManifest(assetId)

  if (!manifest.previewSrc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Project image preview not found.",
    })
  }

  return sendRedirect(event, manifest.previewSrc, 302)
})
