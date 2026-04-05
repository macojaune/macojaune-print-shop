<template>
  <slot :list="list" />
</template>

<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/types'
import { listContentEntries } from '~/composables/useContentCollections'

const props = defineProps<{
  query?: QueryBuilderParams
  path?: string
  limit?: number
}>()

const resolvedQuery: QueryBuilderParams = {
  ...(props.query || {}),
  path: props.query?.path || props.path,
  limit: props.limit ?? props.query?.limit,
}

const requestKey = `legacy-content-list:${JSON.stringify(resolvedQuery)}`

const { data } = await useAsyncData(requestKey, () => listContentEntries(resolvedQuery))

const list = computed(() => data.value ?? [])
</script>
