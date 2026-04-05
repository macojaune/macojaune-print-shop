import type { QueryBuilderParams } from '@nuxt/content/types'
import { listContentEntries } from '~/composables/useContentCollections'

type LegacyWhere = QueryBuilderParams['where']
type LegacySort = QueryBuilderParams['sort']

export function queryContent<T = Record<string, unknown>>(path?: string) {
  const query: QueryBuilderParams = {
    path,
  }

  const api = {
    where(where: LegacyWhere) {
      query.where = where
      return api
    },
    sort(sort: LegacySort) {
      query.sort = sort
      return api
    },
    limit(limit: number) {
      query.limit = limit
      return api
    },
    skip(skip: number) {
      query.skip = skip
      return api
    },
    async find() {
      return (await listContentEntries(query)) as T[]
    },
    async findOne() {
      const [entry] = await api.find()
      return (entry ?? null) as T | null
    },
  }

  return api
}
