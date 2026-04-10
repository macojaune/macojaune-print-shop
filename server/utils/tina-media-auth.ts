import { createError, getHeader } from "h3"
import type { H3Event } from "h3"

const DEFAULT_TINA_IDENTITY_API_URL = "https://identity.tinajs.io"

const getBearerToken = (event: H3Event) => {
  const authorization = getHeader(event, "authorization") || ""
  const match = authorization.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim() || ""
}

export async function assertCanManageTinaMedia(event: H3Event) {
  if (process.env.NODE_ENV !== "production") {
    return
  }

  const token = getBearerToken(event)

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required.",
    })
  }

  const clientId = process.env.TINA_CLIENT_ID

  if (!clientId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Tina media authentication is not configured.",
    })
  }

  const identityApiUrl = (process.env.TINA_IDENTITY_API_URL || DEFAULT_TINA_IDENTITY_API_URL).replace(/\/+$/, "")

  let response: Response

  try {
    response = await fetch(`${identityApiUrl}/v2/apps/${encodeURIComponent(clientId)}/currentUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage: "Unable to verify Tina media authentication.",
    })
  }

  if (!response.ok) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid Tina media authentication.",
    })
  }
}
