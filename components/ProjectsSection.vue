<template>
  <h2 class="mb-3 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
    Participe à mes projets photo en cours
    <small class="font-sans text-base font-normal italic text-red-500">c'est le moment !</small>
  </h2>
  <ContentList v-slot="{list}" :query="projectQuery">
    <div class="mb-2 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:grid-rows-none">
      <nuxt-link
          v-for="project in list"
          :key="project.id"
          :to="`/projets/${project.permalink}?project=${project.permalink}`"
          class="group relative aspect-video rounded-sm"
      >
        <div
            class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"
        />
        <nuxt-img
            :src="project.image"
            format="webp"
            sizes="xs:100vw lg:33vw"
            placeholder
        />
        <div class="absolute bottom-0 z-20 p-5">
          <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
            {{
            project.title
            }}
          </h4>
          <p v-if="project.date">{{ moment(project.date).format('ll') }}</p>
        </div>
      </nuxt-link>
    </div>
    <div v-if="list.length > 3" class="mt-5 flex w-full justify-center">
      <NuxtLink
          class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600"
          to="/projets"
      >
        Voir tous les projets
      </NuxtLink>
    </div>
  </ContentList>
</template>
<script setup lang="ts">
import type {QueryBuilderParams} from "@nuxt/content/types";
import moment from "moment/moment";

const projectQuery: QueryBuilderParams = {
  path: "/projects",
  where: {draft: {$eq: false}}, limit: 4, sort: 
    {date: -1}
}
</script>
