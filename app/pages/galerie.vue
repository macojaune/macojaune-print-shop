<template>
  <div class="min-h-screen w-full px-4 pb-20 pt-4 lg:px-6">
    <div class="mx-auto max-w-[1700px]">
      <ContentList v-slot="{ list }" :query="runQuery">
        <section class="mb-8 border-y border-amber-200/10 py-4 lg:mb-10 lg:py-5">
          <div class="mb-4 max-w-3xl">
            <h1 class="font-display text-4xl uppercase leading-[0.86] text-amber-300 sm:text-5xl lg:text-6xl">
              Yellow Art Gallery
            </h1>
            <p class="mt-3 max-w-[42ch] text-sm leading-6 text-stone-300 sm:text-base">
              Explore les séries photo et ouvre chaque univers en plein écran.
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <NuxtLink
              to="/"
              class="inline-flex min-h-11 w-fit items-center py-2 text-xs uppercase tracking-[0.3em] text-stone-400 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Retour à l&apos;accueil
            </NuxtLink>

            <button
              type="button"
              class="inline-flex min-h-11 w-fit items-center gap-3 py-2 text-xs uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:hidden"
              :aria-expanded="isSeriesMenuOpen ? 'true' : 'false'"
              aria-controls="gallery-series-menu"
              :aria-label="isSeriesMenuOpen ? `Masquer l'index des séries` : `Ouvrir l'index des séries`"
              @click="isSeriesMenuOpen = !isSeriesMenuOpen"
            >
              <span>{{ isSeriesMenuOpen ? "Masquer l'index des séries" : "Ouvrir l'index des séries" }}</span>
              <span class="font-display text-lg leading-none text-amber-300">
                {{ isSeriesMenuOpen ? "−" : "+" }}
              </span>
            </button>
          </div>

          <nav
            id="gallery-series-menu"
            :class="[
              isSeriesMenuOpen ? 'block' : 'hidden',
              'mt-4 lg:block lg:columns-2 lg:[column-gap:1.25rem] lg:[column-rule:1px_solid_rgba(251,191,36,0.18)]',
            ]"
          >
            <details
              v-for="group in getGallerySeriesGroups(list)"
              :key="`year-group-${group.year}`"
              :open="openYear === group.year"
              class="mb-3 w-full rounded-sm border border-white/10 bg-stone-950/40 px-3 py-2 transition open:border-amber-300/35 open:bg-stone-900/60 lg:[break-inside:avoid] lg:mx-1.5"
            >
              <summary
                class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black [&::-webkit-details-marker]:hidden"
                @click.prevent="toggleYearGroup(group.year)"
              >
                <span class="font-display text-xl uppercase leading-none text-amber-200 sm:text-2xl">
                  {{ group.year }}
                </span>
                <span class="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                  {{ group.items.length }} séries
                </span>
              </summary>

              <div class="grid grid-cols-1 gap-x-4 gap-y-0.5 pb-1 pt-2 sm:grid-cols-2">
                <NuxtLink
                  v-for="(series, seriesIndex) in group.items"
                  :key="series.slug"
                  :to="`/series/${series.slug}`"
                  class="group flex w-full min-h-10 min-w-0 items-start gap-3 border-b border-white/8 py-2 text-left transition hover:border-amber-200/22 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <span class="min-w-[1.65rem] pt-0.5 text-xs font-medium tabular-nums tracking-normal text-amber-300/78">
                    {{ String(seriesIndex + 1).padStart(2, "0") }}.
                  </span>
                  <span class="min-w-0 truncate text-sm font-medium leading-5 text-stone-200 transition group-hover:text-amber-100 sm:text-[0.95rem]">
                    {{ series.title }}
                  </span>
                </NuxtLink>
              </div>
            </details>
          </nav>
        </section>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[92px] lg:gap-5">
          <NuxtLink
            v-for="(item, index) in getGalleryBoardTiles(list)"
            :key="item.key"
            :to="`/series/${item.seriesSlug}`"
            :class="galleryFeedClass(item, index)"
            class="group relative isolate overflow-hidden bg-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <div class="absolute inset-0">
              <RunImage
                :src="item.src"
                :alt="item.alt"
                variant="card"
                sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
                loading="lazy"
                fetchpriority="low"
                :class="
                  item.kind === 'series'
                    ? 'h-full w-full object-cover opacity-70 transition duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-82'
                    : 'absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]'
                "
              />
            </div>

            <template v-if="item.kind === 'series'">
              <div class="absolute inset-0 bg-gradient-to-t from-black/94 via-black/24 to-black/20" />
              <div
                class="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.16),transparent_64%)] opacity-0 transition duration-500 group-hover:opacity-100 lg:group-focus-visible:opacity-100"
              />
              <div class="absolute inset-[1px] border border-amber-200/8 transition duration-300 group-hover:border-amber-200/20" />

              <div class="relative z-10 flex h-full items-end p-4 lg:p-5">
                <div>
                  <p v-if="item.seriesDate" class="text-[10px] uppercase tracking-[0.34em] text-amber-300/76">
                    {{ formatPhotoDate(item.seriesDate) }}
                  </p>
                  <div class="mt-2 h-px w-10 bg-amber-300/70 transition duration-500 group-hover:w-16 lg:group-focus-visible:w-16" />
                  <h3 class="mt-3 max-w-[10ch] text-balance font-display text-[1.95rem] uppercase leading-[0.9] text-white transition duration-500 group-hover:text-amber-100 lg:text-[2.9rem]">
                    {{ item.seriesTitle }}
                  </h3>
                  <div class="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-stone-300/72">
                    <span>{{ item.tileCount }} images</span>
                    <span class="h-1 w-1 rounded-full bg-amber-300/45" />
                    <span>Ouvrir</span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent opacity-0 transition duration-500 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
              />
              <div
                class="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.2),transparent_62%)] opacity-0 transition duration-500 group-hover:opacity-100 lg:group-focus-visible:opacity-100"
              />
              <div class="absolute inset-[1px] border border-amber-200/0 transition duration-500 lg:group-hover:border-amber-200/18 lg:group-focus-visible:border-amber-200/18" />

              <div class="relative z-10 flex h-full items-end p-4 lg:p-5">
                <div
                  class="translate-y-6 opacity-0 transition duration-500 ease-out lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:translate-y-0 lg:group-focus-visible:opacity-100"
                >
                  <p
                    v-if="item.seriesDate"
                    class="text-[10px] uppercase tracking-[0.34em] text-amber-300/78"
                  >
                    {{ formatPhotoDate(item.seriesDate) }}
                  </p>
                  <div class="mt-2 h-px w-10 bg-amber-300/70 transition duration-500 group-hover:w-16 lg:group-focus-visible:w-16" />
                  <h3 class="mt-3 max-w-[10ch] text-balance font-display text-[1.85rem] uppercase leading-[0.9] text-white transition duration-500 group-hover:text-amber-100 lg:text-[2.7rem]">
                    {{ item.seriesTitle }}
                  </h3>
                </div>
              </div>
            </template>
          </NuxtLink>
        </div>
      </ContentList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { QueryBuilderParams } from "@nuxt/content/types"
import { formatPhotoDate } from "../utils/photo-dates"
import { getSeriesCoverImage, getSeriesGalleryTiles } from "../utils/runs"
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

type GalleryBoardTile = {
  kind: "photo" | "series"
  key: string
  src: string
  alt: string
  seriesSlug: string
  seriesTitle: string
  seriesDate?: string
  tileCount: number
}

type GallerySeriesEntry = {
  slug: string
  title: string
  date?: string
  year: string
  coverImage: string
  tileCount: number
}

type GallerySeriesGroup = {
  year: string
  items: GallerySeriesEntry[]
}

const gallerySeed = useState("gallery-preview-seed", () => Math.random())
const isSeriesMenuOpen = ref(false)
const openYear = ref<string | null>(null)

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const toTimestamp = (value?: string) => {
  const timestamp = new Date(value || "").getTime()
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp
}

const getSeriesYear = (value?: string) => {
  const parsedDate = new Date(value || "")
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sans date"
  }

  return String(parsedDate.getFullYear())
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
  runs.flatMap((run) => {
    const shuffledTiles = shuffleSeries(getSeriesGalleryTiles(run), `gallery-${run.slug}`).slice(0, 10)
    const spotlightSrc = shuffledTiles[0]?.src

    return shuffledTiles.map((tile) => ({
        kind: tile.src === spotlightSrc ? "series" : "photo",
        key: `${run.slug}-${tile.src}`,
        ...tile,
        seriesSlug: run.slug,
        seriesTitle: run.title || "Serie",
        seriesDate: run.date,
        alt: tile.alt || run.title || "Serie photo",
        tileCount: shuffledTiles.length,
      }))
  })

const getGallerySeries = (runs: GalleryBoardRun[]): GallerySeriesEntry[] =>
  [...runs]
    .sort((left, right) => toTimestamp(right.date) - toTimestamp(left.date))
    .map((run) => {
      const shuffledTiles = shuffleSeries(getSeriesGalleryTiles(run), `series-${run.slug}`)
      const coverImage = getSeriesCoverImage(run) || shuffledTiles[0]?.src || ""

      return {
        slug: run.slug,
        title: run.title || "Serie",
        date: run.date,
        year: getSeriesYear(run.date),
        coverImage,
        tileCount: shuffledTiles.length,
      }
    })
    .filter((series) => Boolean(series.slug) && Boolean(series.coverImage || series.tileCount))

const getGallerySeriesGroups = (runs: GalleryBoardRun[]): GallerySeriesGroup[] => {
  const groupedSeries = new Map<string, GallerySeriesEntry[]>()

  getGallerySeries(runs).forEach((series) => {
    const entries = groupedSeries.get(series.year)

    if (entries) {
      entries.push(series)
      return
    }

    groupedSeries.set(series.year, [series])
  })

  const toYearScore = (year: string) => {
    if (year === "Sans date") {
      return Number.NEGATIVE_INFINITY
    }

    const parsedYear = Number(year)
    return Number.isNaN(parsedYear) ? Number.NEGATIVE_INFINITY : parsedYear
  }

  return Array.from(groupedSeries.entries())
    .sort((left, right) => toYearScore(right[0]) - toYearScore(left[0]))
    .map(([year, items]) => ({
      year,
      items: [...items].sort((left, right) => toTimestamp(right.date) - toTimestamp(left.date)),
    }))
}

const toggleYearGroup = (year: string) => {
  openYear.value = openYear.value === year ? null : year
}

const galleryFeedClass = (item: GalleryBoardTile, index: number) => {
  const photoPattern = [
    "min-h-[32rem] lg:col-span-8 lg:row-span-7",
    "min-h-[22rem] lg:col-span-4 lg:row-span-4",
    "min-h-[24rem] lg:col-span-5 lg:row-span-5",
    "min-h-[22rem] lg:col-span-3 lg:row-span-3",
    "min-h-[24rem] lg:col-span-4 lg:row-span-4",
    "min-h-[28rem] lg:col-span-7 lg:row-span-6",
    "min-h-[22rem] lg:col-span-5 lg:row-span-4",
  ]
  const seriesPattern = [
    "min-h-[26rem] lg:col-span-4 lg:row-span-5",
    "min-h-[30rem] lg:col-span-5 lg:row-span-6",
    "min-h-[24rem] lg:col-span-3 lg:row-span-4",
    "min-h-[28rem] lg:col-span-6 lg:row-span-5",
  ]

  if (item.kind === "series") {
    return seriesPattern[index % seriesPattern.length]
  }

  return photoPattern[index % photoPattern.length]
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
        "@context": "https://schema.org",
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
