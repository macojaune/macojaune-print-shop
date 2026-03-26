import { createError, defineEventHandler, readBody } from "h3"

import { deleteR2ImageAsset } from "../../utils/r2-images"

export default defineEventHandler(async (event) => {
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
