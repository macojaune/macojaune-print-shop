<template>
  <div class="min-h-screen w-full px-4 pb-20 pt-4 lg:px-6">
    <div class="mx-auto max-w-[1700px]">
      <header class="mb-10 border-b border-amber-200/10 pb-8 lg:mb-14 lg:pb-10">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-4xl">
            <NuxtLink
              to="/"
              class="inline-flex w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
            >
              Retour à l&apos;accueil
            </NuxtLink>
            <h1 class="mt-4 max-w-[10ch] font-display text-5xl leading-[0.84] text-amber-400 sm:text-6xl lg:text-[7.25rem]">
              Yellow Art Gallery
            </h1>
          </div>
        </div>
      </header>

      <ContentList v-slot="{ list }" :query="runQuery">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[92px] lg:gap-5">
          <NuxtLink
            v-for="(tile, index) in getGalleryBoardTiles(list)"
            :key="`${tile.seriesSlug}-${tile.src}`"
            :to="`/series/${tile.seriesSlug}`"
            :class="chaosTileClass(index)"
            class="group relative isolate overflow-hidden bg-stone-950"
          >
            <RunImage
              :src="tile.src"
              :alt="tile.alt"
              variant="card"
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
              loading="lazy"
              fetchpriority="low"
              class="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
            />

            <div
              class="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent opacity-100 transition duration-500 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            />
            <div
              class="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.2),transparent_62%)] opacity-0 transition duration-500 group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            />
            <div class="absolute inset-[1px] border border-amber-200/0 transition duration-500 group-hover:border-amber-200/18 lg:group-focus-visible:border-amber-200/18" />

            <div class="relative z-10 flex h-full items-end p-4 lg:p-5">
              <div
                class="translate-y-0 transition duration-500 ease-out lg:translate-y-6 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100"
              >
                <p
                  v-if="tile.seriesDate"
                  class="text-[10px] uppercase tracking-[0.34em] text-amber-300/78"
                >
                  {{ formatPhotoDate(tile.seriesDate) }}
                </p>
                <div class="mt-2 h-px w-10 bg-amber-300/70 transition duration-500 group-hover:w-16 lg:group-focus-visible:w-16" />
                <h2 class="mt-3 max-w-[10ch] font-display text-[1.85rem] uppercase leading-[0.9] text-white transition duration-500 group-hover:text-amber-100 lg:text-[2.7rem]">
                  {{ tile.seriesTitle }}
                </h2>
              </div>
            </div>
          </NuxtLink>
        </div>
      </ContentList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { QueryBuilderParams } from "@nuxt/content/types"
import { formatPhotoDate } from "../utils/photo-dates"
import { getSeriesGalleryTiles } from "../utils/runs"
import type { RunLike } from "../utils/runs"

const { toAssetUrl } = useAssetUrls()

const runQuery: QueryBuilderParams = {
  path: "/runs",
  sort: { date: -1 },
}

type GalleryBoardRun = RunLike & {
  slug: string
  date?: string
}

const gallerySeed = useState("gallery-preview-seed", () => Math.random())

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

function shuffleSeries<T>(series: T[], seedLabel: string) {
  const shuffled = [...series]
  let seed = Array.from(`${seedLabel}-${gallerySeed.value}`).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  )

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    seed += 1
    const swapIndex = Math.floor(seededRandom(seed) * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

const getGalleryBoardTiles = (runs: GalleryBoardRun[]) =>
  runs.flatMap((run) =>
    shuffleSeries(getSeriesGalleryTiles(run), `gallery-${run.slug}`)
      .slice(0, 10)
      .map((tile) => ({
        ...tile,
        seriesSlug: run.slug,
        seriesTitle: run.title || "Serie",
        seriesDate: run.date,
        alt: tile.alt || run.title || "Serie photo",
      })),
  )

const chaosTileClass = (index: number) => {
  const pattern = [
    "min-h-[32rem] lg:col-span-8 lg:row-span-7",
    "min-h-[22rem] lg:col-span-4 lg:row-span-4 lg:translate-y-8",
    "min-h-[24rem] lg:col-span-5 lg:row-span-5",
    "min-h-[22rem] lg:col-span-3 lg:row-span-3 lg:-translate-y-6",
    "min-h-[24rem] lg:col-span-4 lg:row-span-4",
    "min-h-[28rem] lg:col-span-7 lg:row-span-6 lg:translate-y-10",
    "min-h-[22rem] lg:col-span-5 lg:row-span-4",
  ]

  return pattern[index % pattern.length]
}

const description =
  "Découvrez les séries photo de Macojaune dans Yellow Art Gallery."

useHead({
  title: "Yellow Art Gallery - Macojaune",
  meta: [
    {
      name: "title",
      content: "Yellow Art Gallery - Macojaune",
    },
    {
      name: "description",
      content: description,
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://macojaune.com/galerie" },
    { property: "og:title", content: "Yellow Art Gallery" },
    {
      property: "og:description",
      content: description,
    },
    { property: "og:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
    {
      property: "twitter:card", content: "summary_large_image",
    },
    { property: "twitter:url", content: "https://macojaune.com/galerie" },
    { property: "twitter:title", content: "Yellow Art Gallery" },
    {
      property: "twitter:description",
      content: description,
    },
    { property: "twitter:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
  ],
  link: [
    {
      rel: "canonical",
      href: "https://macojaune.com/galerie",
    },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "http://schema.org/",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@id": "https://macojaune.com/",
              name: "Macojaune.com",
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            item: {
              "@id": "https://macojaune.com/galerie",
              name: "Yellow Art Gallery",
            },
          },
        ],
      }),
    },
  ],
})
</script>
