
<template>
  <section class="space-y-7 lg:space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl">
        <h2 class="leading-[0.95] font-display text-4xl text-amber-400 lg:text-5xl">
          Derniers articles
        </h2>
        <p class="mt-2 text-sm leading-6 text-stone-300">
          Ce que les images ne racontent pas toujours.
        </p>
      </div>
      <NuxtLink
        class="inline-flex min-h-11 w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-amber-200 transition hover:text-amber-400"
        to="/blog"
      >
        Voir les articles
      </NuxtLink>
    </div>

    <div v-if="list" class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(12rem,_1fr)]">
      <nuxt-link
        v-for="(blog, index) in list"
        :key="blog.permalink"
        :to="`/blog/${blog.permalink}`"
        :class="blogCardClass(index)"
        class="group relative overflow-hidden bg-stone-950"
      >
        <nuxt-img
          :src="toAssetUrl(blog.image)"
          class="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          format="webp"
          placeholder
          :sizes="blogImageSizes(index)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 transition duration-300 group-hover:from-black/95 group-hover:via-black/55" />
        <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-amber-200/10 to-transparent opacity-50 transition duration-300 group-hover:opacity-90" />

        <div class="relative z-10 flex h-full flex-col justify-end p-5 lg:p-6">
          <p v-if="blog.date" class="mb-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
            {{ formatCardDate(blog.date) }}
          </p>
          <h3 class="max-w-[14ch] font-display text-3xl leading-none text-white transition duration-300 group-hover:text-amber-200 lg:text-4xl">
            {{ blog.title }}
          </h3>
        </div>
      </nuxt-link>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { getBlogEntries } from "../composables/useContentCollections";

const { toAssetUrl } = useAssetUrls()
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" })
const toTimestamp = (value?: string | null) => {
  if (!value) {
    return Number.POSITIVE_INFINITY
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? Number.POSITIVE_INFINITY : date.getTime()
}

const { data: list } = await useAsyncData("home-blog-list", async () =>
  (await getBlogEntries())
    .sort(
      (left, right) =>
        toTimestamp(right.createdAt || right.date || null) -
        toTimestamp(left.createdAt || left.date || null),
    )
    .slice(0, 4),
)

const blogCardClass = (index: number) => {
  if (index === 0) {
    return "min-h-[22rem] lg:col-span-8 lg:row-span-2"
  }

  if (index === 1) {
    return "min-h-[16rem] lg:col-span-4 lg:row-span-1"
  }

  return "min-h-[16rem] lg:col-span-6 lg:row-span-1"
}

const blogImageSizes = (index: number) =>
  index === 0
    ? "(max-width: 1023px) 100vw, 66vw"
    : "(max-width: 1023px) 100vw, 34vw"

const formatCardDate = (value?: string | null) => {
  if (!value) {
    return ""
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? "" : dateFormatter.format(parsedDate)
}
</script>
