<template>
  <slot :doc="doc" />
</template>

<script setup lang="ts">
import { findContentDocumentByPath } from '~/composables/useContentCollections'

const props = defineProps<{
  path: string
}>()

const requestKey = `legacy-content-doc:${props.path}`

const { data } = await useAsyncData(requestKey, () => findContentDocumentByPath(props.path))

const doc = computed(() => data.value ?? null)
</script>
