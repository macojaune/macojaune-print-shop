<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1 class="my-3 text-4xl uppercase text-orange-400">
          {{ doc?.title }}
        </h1>
        <ContentRenderer v-if="doc" class="text-white" :value="doc" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { findMentionEntryBySlug } from '~/composables/useContentCollections'

const route = useRoute()
const mentionSlug = computed(() => {
  const { slug } = route.params
  return Array.isArray(slug) ? slug.join('/') : String(slug || '')
})

const doc = await findMentionEntryBySlug(mentionSlug.value)

if (!doc) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Mention introuvable',
  })
}
</script>
