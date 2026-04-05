<template>
  <div class="w-full px-4 py-6 lg:px-6 lg:py-8">
    <div class="mx-auto max-w-[1500px]">
      <header class="grid gap-8 border-b border-amber-200/10 pb-10 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-14">
        <div class="lg:col-span-8">
          <NuxtLink
            to="/"
            class="inline-flex w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
          >
            Retour à l&apos;accueil
          </NuxtLink>
          <h1 class="mt-5 max-w-[11ch] font-display text-5xl leading-[0.84] text-amber-400 lg:text-[6rem]">
            Projets photographiques
          </h1>
        </div>

        <div class="lg:col-span-4 lg:pb-2">
          <p class="max-w-[30ch] text-base leading-7 text-stone-300">
            Des idées encore en mouvement, avec le brief, les inspirations et de quoi y participer si le projet t&apos;appelle.
          </p>
        </div>
      </header>

      <ContentList v-slot="{ list }" :query="query">
        <div class="pt-10 lg:pt-14">
          <div class="flex flex-col">
            <nuxt-link
              v-for="project in list"
              :key="project.permalink"
              :to="`/projets/${project.permalink}?project=${project.permalink}`"
              class="group border-b border-amber-200/10 py-6 transition lg:py-8"
            >
              <div class="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-8">
                <div v-if="project.image" class="overflow-hidden bg-stone-950 lg:col-span-3">
                  <nuxt-img
                    :src="toAssetUrl(project.image)"
                    :alt="project.title"
                    format="webp"
                    placeholder
                    sizes="(max-width: 1023px) 100vw, 25vw"
                    class="aspect-[4/5] h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div :class="project.image ? 'lg:col-span-5' : 'lg:col-span-7'">
                  <div class="flex flex-col gap-3">
                    <p
                      v-if="project.date"
                      class="text-[11px] uppercase tracking-[0.32em] text-amber-300/72"
                    >
                      {{ moment(project.date).format("ll") }}
                    </p>
                    <h2 class="max-w-[11ch] font-display text-4xl leading-[0.9] text-white transition group-hover:text-amber-200 lg:text-[3.5rem]">
                      {{ project.title }}
                    </h2>
                  </div>
                </div>

                <div :class="project.image ? 'lg:col-span-4' : 'lg:col-span-4 lg:col-start-9'" class="lg:self-end">
                  <p class="text-base leading-7 text-stone-300 line-clamp-4 lg:text-[1.02rem]">
                    {{ project?.description }}
                  </p>
                  <div class="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/72">
                    <span>Découvrir</span>
                    <span class="h-px w-10 bg-amber-300/55 transition duration-300 group-hover:w-16" />
                  </div>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
      </ContentList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment/moment"
import type { QueryBuilderParams } from "@nuxt/content/types"

const { toAssetUrl } = useAssetUrls()

const query: QueryBuilderParams = { path: "/projects", where: [{ draft: false }], sort: [{ date: -1 }] }

const title = "Les Projets photo du Macojaune"
const description =
  "Moodboards, idées de projets photo, inspirations, et tout ce qu'il faut pour y participer. Créons ensemble des œuvres qui nous ressemblent."
useHead({
  title,
  meta: [
    {
      name: "title",
      content: title,
    },
    {
      name: "description",
      content: description,
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://macojaune.com/projets" },
    { property: "og:title", content: title },
    {
      property: "og:description",
      content: description,
    },
    { property: "og:image", content: toAssetUrl("/pictures/MCO09198 (Large).jpg") },
    {
      property: "twitter:card", content: "summary_large_image",
    },
    { property: "twitter:url", content: "https://macojaune.com/projets" },
    { property: "twitter:title", content: title },
    {
      property: "twitter:description",
      content: description,
    },
    { property: "twitter:image", content: toAssetUrl("/pictures/MCO09198 (Large).jpg") },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: [
        { "@context": "http://schema.org/" },
        { "@type": "BreadcrumbList" },
        {
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": "https://macojaune.com",
                name: "Homepage",
              },
            }, {
              "@type": "ListItem",
              position: 2,
              item: {
                "@id": "https://macojaune.com/projets",
                name: "Projets photographiques",
              },
            },
          ],
        },
      ],
    },
  ],
})
</script>
