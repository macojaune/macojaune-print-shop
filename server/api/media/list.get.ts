import { defineEventHandler, getQuery } from "h3"

import { listR2Images } from "../../utils/r2-images"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit || 50)
  const offset = typeof query.offset === "string" ? query.offset : undefined
  const directory = typeof query.directory === "string" ? query.directory : undefined

  return listR2Images(limit, offset, directory)
})
