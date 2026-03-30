<template>
  <div class="w-full px-4">
    <div>
      <h1 class="my-4 font-display text-5xl uppercase text-amber-600 lg:my-3 lg:text-7xl">
        {{ data?.title ?? "" }}
      </h1>
      <div class="w-full lg:w-7/12">
        <ContentRenderer v-if="data" class="text-white" :value="data"/>
      </div>
    </div>
    <div v-if="nextPost" class="mt-8 flex w-full flex-row justify-end px-0 lg:mt-12 lg:px-8 ">
      <nuxt-link :href="`/blog/${nextPost.permalink}`" class="w-1/2 text-right md:w-auto">
        <span class="font-display text-xl font-medium text-white lg:text-3xl">{{
            nextPost?.title?.toLowerCase().startsWith('[projet]') ? 'Projet' : "Article"
          }} suivant</span>
        <br>
        <span class="font-sans text-base/snug italic text-amber-300 md:text-lg">{{ nextPost.title }}</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { findBlogEntryByPermalink, findNextBlogEntry } from '~/composables/useContentCollections'

const { path, params } = useRoute()
const permalink = computed(() => String(params?.permalink || ''))

const data = await findBlogEntryByPermalink(permalink.value)

if (!data) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article introuvable',
  })
}

const nextPost = await findNextBlogEntry(data.date as string | null | undefined)

const title = data.title ? `${data.title} | Le blog du Macojaune` : 'Le blog du Macojaune'
useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title + ' | Le blog du Macojaune'
    },
    {
      name: 'description',
      content: data.description

    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: `https://macojaune.com${path}`},
    {property: 'og:title', content: title},
    {
      property: 'og:description',
      content: data.description
    },
    {property: 'og:image', content: String(data.image || '')},
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    {property: 'twitter:url', content: `https://macojaune.com${path}`},
    {property: 'twitter:title', content: title + ' | Le blog du Macojaune'},
    {
      property: 'twitter:description',
      content: data.description
    },
    {property: 'twitter:image', content: String(data.image || '')}
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'http://schema.org/',
        '@type': 'BreadcrumbList',

        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': 'https://macojaune.com',
              name: 'Homepage'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/blog/',
              name: "Blog"
            }
          }, {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': 'https://macojaune.com/blog/' + params.permalink,
              name: params.permalink
            }
          }
        ]
      })
    },
  ]
})
</script>

<style>

</style>
