<template>
  <div class="w-full px-4">
    <div>
      <h1 class="font-display uppercase text-amber-600 text-5xl my-4 lg:my-3 lg:text-7xl">
        {{ data?.title ?? "" }}
      </h1>
      <div class="lg:w-7/12 w-full">
        <ContentRenderer class="text-white" :value="data"/>
      </div>
    </div>
    <div class="w-full lg:mt-12 mt-8 px-0 lg:px-8 flex flex-row justify-end " v-if="nextPost">
      <nuxt-link :href="'/blog/'+nextPost.permalink" class="w-1/2 md:w-auto text-right">
        <span class="text-white font-medium font-display text-xl lg:text-3xl">Article suivant</span>
        <br>
        <span class="text-base/snug md:text-lg font-sans italic text-amber-300">{{ nextPost.title }}</span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
const {path, params} = useRoute()
const {data} = await useAsyncData('get-document', () =>
  queryContent('/blog').where({permalink: `${params?.permalink}`}).findOne())
const nextPost = await queryContent("/blog").where({date: {$lt: data.value?.date}}).sort({_id: -1}).findOne()

const title = data.value?.title ? `${data.value?.title} | Le blog du Macojaune` : "Le blog du Macojaune"
useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title
    },
    {
      name: 'description',
      content: data.value?.description

    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: `https://macojaune.com${path}`},
    {property: 'og:title', content: title},
    {
      property: 'og:description',
      content: data.value?.description
    },
    {property: 'og:image', content: `https://macojaune.com/${data.value?.image}`},
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    {property: 'twitter:url', content: `https://macojaune.com${path}`},
    {property: 'twitter:title', content: title},
    {
      property: 'twitter:description',
      content: data.value?.description
    },
    {property: 'twitter:image', content: `https://macojaune.com/${data.value?.image}`}
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
              '@id': 'https://macojaune.com/blog/' + params.permalink,
              name: params.permalink
            }
          }
        ]
      })
    }
  ]
})
</script>

<style>
h1, h2, h3, h4, h5, h6 {
  @apply font-display font-bold text-lg mt-3 mb-2 lg:mt-4 lg:mb-3;
}

p {
  @apply text-base mb-4;
}

a {
  @apply text-amber-400 hover:text-amber-600 font-bold;
}
</style>
