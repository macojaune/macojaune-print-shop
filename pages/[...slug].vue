<template lang="pug">
.container
  .row
    .col
      h1.my-3.text-4xl.uppercase.text-orange-400 {{ doc.title }}
      ContentRenderer.text-white(:value="doc")
</template>

<script setup lang="ts">
import { findContentDocumentByPath } from '~/composables/useContentCollections'

const route = useRoute()

const slugSegments = Array.isArray(route.params.slug)
  ? route.params.slug.map(String).filter(Boolean)
  : route.params.slug
    ? [String(route.params.slug)]
    : []

const contentPath = `/${(slugSegments[0] === 'mentions' ? slugSegments : ['mentions', ...slugSegments]).join('/')}`

const doc = await findContentDocumentByPath(contentPath)

if (!doc) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Document introuvable',
  })
}
</script>
