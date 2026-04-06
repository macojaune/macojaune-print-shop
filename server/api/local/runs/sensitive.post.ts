import { createError, defineEventHandler, getRequestHost, readBody } from "h3"

import { updateRunSensitiveImage } from "../../../utils/local-run-sensitivity"

const localHostPattern = /^(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?$/i

export default defineEventHandler(async (event) => {
  const host = getRequestHost(event, { xForwardedHost: true })
  const isAllowedLocalHost = localHostPattern.test(host)

  if (!import.meta.dev || !isAllowedLocalHost) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not found.",
    })
  }

  const body = await readBody<{ sensitive?: boolean; slug?: string; src?: string }>(event)

  if (typeof body?.slug !== "string" || typeof body?.src !== "string" || typeof body?.sensitive !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request payload.",
    })
  }

  return updateRunSensitiveImage({
    sensitive: body.sensitive,
    slug: body.slug,
    src: body.src,
  })
})
