import { createError, defineEventHandler, getRouterParam, sendRedirect } from "h3"

import { getR2ImageManifest } from "../../../utils/r2-images"

export default defineEventHandler(async (event) => {
  const assetId = getRouterParam(event, "assetId")

  if (!assetId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Run image not found.",
    })
  }

  const manifest = await getR2ImageManifest(assetId)
  const previewSrc =
    manifest.detail.webp[manifest.detail.webp.length - 1]?.src ||
    manifest.card.webp[manifest.card.webp.length - 1]?.src ||
    manifest.previewSrc

  if (!previewSrc) {
    throw createError({
      statusCode: 404,
      statusMessage: "Run image preview not found.",
    })
  }

  return sendRedirect(event, previewSrc, 302)
})
