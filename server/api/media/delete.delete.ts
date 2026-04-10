import { createError, defineEventHandler, readBody } from "h3"

import { deleteR2ImageAsset } from "../../utils/r2-images"
import { assertCanManageTinaMedia } from "../../utils/tina-media-auth"

export default defineEventHandler(async (event) => {
  await assertCanManageTinaMedia(event)

  const body = await readBody<{ id?: string }>(event)

  if (!body?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing asset id.",
    })
  }

  await deleteR2ImageAsset(body.id)

  return { ok: true }
})
