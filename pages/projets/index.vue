<template>
  <div class="my-6 lg:my-10">
    <h1 class="text-4xl lg:text-5xl text-amber-600 font-display mb-4">Projets photographiques</h1>
    <p class="text-white text-base">Je me suis enfin décidé à publier mes idées de projets photo sur ce site. Le but est
      bien entendu d'arriver à les mener à bien.
      <br>
      Tu retrouveras le brief, les moodboards, inspirations et un formulaire pour y participer si ça te chante !
    </p>
  </div>
  <ContentList v-slot="{list}" :query="query">
    <div class="mb-2 flex flex-col gap-5">
      <nuxt-link
        v-for="project in list"
        :key="project.permalink"
        :to="`/projets/${project.permalink}?project=${project.permalink}`"
        class="group flex flex-row justify-between"
      >
        <div>
          <h4 class="font-display text-4xl text-amber-300 group-hover:text-amber-600">
            {{
              project.title
            }}
            <span class="font-sans text-sm">{{ moment(project.date).format('ll') }}</span>
          </h4>
          <prose-p class="text-white text-base ml-6 w-4/5 lg:w-8/12 line-clamp-4">{{ project?.description }}</prose-p>
        </div>
        <!--        <div v-if="project.image">-->
        <!--          <nuxt-img-->
        <!--            :src="project.image" class="aspect-portrait" format="webp" placeholder-->
        <!--            sizes="xs:25vw lg:360px"/>-->
        <!--        </div>-->
      </nuxt-link>
    </div>
  </ContentList>
</template>

<script lang="ts" setup>
import moment from "moment/moment";
import type {QueryBuilderParams} from "@nuxt/content/types";

const query: QueryBuilderParams = {path: "/projects", where: [{draft: false}], sort: [{date: -1}]}

const description =
  "Moodboards, idées de projets photo, inspirations, et tout ce qu'il faut pour y participer. Créons ensemble des œuvres qui nous ressemblent."
useHead({
  title: 'Les Projets photo du Macojaune',
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

