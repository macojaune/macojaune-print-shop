
<template>
  <section>
    <h2 class="mb-8 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
      Mes derniers articles
    </h2>
    <ContentList v-slot="{list}" :query="blogQuery">
      <div class="mb-2 grid grid-rows-4 gap-5 lg:grid-cols-4 lg:grid-rows-none">
        <nuxt-link
          v-for="blog in list"
          :key="blog.id"
          :to="`/blog/${blog.permalink}`"
          class="group relative aspect-square rounded-sm bg-amber-400/60"
        >
          <div
            class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"
          />
          <nuxt-img
            :src="blog.image"
            class="absolute inset-0 z-0 h-full"
            format="webp"
            placeholder
            sizes="xs:25vw lg:360px"
          />
          <div class="absolute bottom-0 z-20 p-5">
            <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
              {{
                blog.title
              }}
            </h4>
            <p v-if="blog.date">{{ moment(blog.date).format('ll') }}</p>
          </div>
        </nuxt-link>
      </div>
      <div class="mt-5 flex w-full justify-center">
        <NuxtLink
          class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600"
          to="/blog"
        >
          C'est
          tout ?
        </NuxtLink>
      </div>
    </ContentList>
  </section>
</template>

<script lang="ts" setup>
import moment from "moment/moment";
import type {QueryBuilderParams} from "@nuxt/content/types";

const blogQuery: QueryBuilderParams = {
  path: "/blog",
  where: {draft: {$eq: false},}, limit: 4, sort: {date: -1}
}
</script>
