<template>
  <ContentList v-slot="{list}" :query="query">
    <div class="mb-2 flex flex-col gap-5">
      <nuxt-link
        v-for="blog in list"
        :key="blog.permalink"
        :to="`/blog/${blog.permalink}`"
        class="group flex flex-row justify-between"
      >
        <div>
          <h4 class="font-display text-4xl text-amber-300 group-hover:text-amber-600">
            {{
              blog.title
            }}
            <span class="font-sans text-sm">{{ moment(blog.date).format('ll') }}</span>
          </h4>
          <prose-p class="text-white text-base ml-6 w-8/12 line-clamp-2">{{ blog?.description }}</prose-p>
        </div>
        <div>
          <nuxt-img :src="blog.image" sizes="xs:25vw lg:360px" format="webp" placeholder
                    class="aspect-portrait"/>
        </div>
      </nuxt-link>
    </div>
  </ContentList>
</template>

<script lang="ts" setup>
import moment from "moment/moment";
import type {QueryBuilderParams} from "@nuxt/content/types";

const query: QueryBuilderParams = {path: "/blog", where: [{draft: false}], sort: [{date: -1}]}

const description =
  "Pensées et tribulations d'un grand curieux guadeloupéen, artiste photographe, geek, développeur et entrepreneur."
useHead({
  title: 'Le Blog du Macojaune',
  meta: [
    {
      name: 'title',
      content: 'Le blog du Macojaune'
    },
    {
      name: 'description',
      content: description
    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: 'https://macojaune.com/blog'},
    {property: 'og:title', content: 'Le blog du Macojaune'},
    {
      property: 'og:description',
      content: description
    },
    {property: 'og:image', content: '/pictures/dsc06261.jpg'},
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    {property: 'twitter:url', content: 'https://macojaune.com/'},
    {property: 'twitter:title', content: 'Le blog du Macojaune'},
    {
      property: 'twitter:description',
      content: description
    },
    {property: 'twitter:image', content: 'https://macojaune.com/pictures/dsc06261.jpg'}
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: [
        {'@context': 'http://schema.org/'},
        {'@type': 'BreadcrumbList'},
        {
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@id': 'https://macojaune.com',
                name: 'Homepage'
              }
            }, {
              '@type': 'ListItem',
              position: 2,
              item: {
                '@id': 'https://macojaune.com/blog',
                name: 'Blog'
              }
            }
          ]
        }
      ]
    }
  ]
})
</script>

