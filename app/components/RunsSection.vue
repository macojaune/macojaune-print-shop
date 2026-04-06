<template>
  <section>
    <div class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl">
        <h2 class="leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
          Mes photos
        </h2>
        <p class="mt-2 text-sm text-stone-300">
          Des séries réalisées au fil des années.
        </p>
      </div>
      <NuxtLink
        class="inline-flex min-h-11 w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-amber-200 transition hover:text-amber-400"
        to="/galerie"
      >
        Voir toutes les séries
      </NuxtLink>
    </div>
    <ContentList v-slot="{ list }" :query="runQuery">
      <div class="mb-2">
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-2">
          <NuxtLink
            v-for="serie in getHomepageSeries(list).slice(0, 15)"
            :key="serie.slug"
            :to="`/series/${serie.slug}`"
            class="group relative block overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <div class="aspect-[4/5] overflow-hidden bg-stone-900">
              <RunImage
                :src="serie.previewImage.src"
                :alt="serie.previewImage.alt || serie.title"
                variant="thumb"
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                loading="lazy"
                fetchpriority="low"
                class="h-full w-full object-cover transition duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.04] group-hover:brightness-[0.84] group-focus-visible:scale-[1.04] group-focus-visible:brightness-[0.84]"
              />
            </div>

            <div
              class="pointer-events-none absolute inset-0 opacity-100 transition duration-300 motion-reduce:transition-none lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
            >
              <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.06)_0%,rgba(12,10,9,0.14)_26%,rgba(12,10,9,0.62)_64%,rgba(12,10,9,0.94)_100%)]"
              />
              <div
                class="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_68%)] opacity-80"
              />
              <div
                class="absolute inset-[1px] border border-amber-200/0 transition duration-300 group-hover:border-amber-200/25 group-focus-visible:border-amber-200/25"
              />
              <div class="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <div
                  class="translate-y-0 transition duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:transition-none lg:translate-y-3 lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0"
                >
                  <p
                    v-if="serie.date"
                    class="text-[10px] uppercase tracking-[0.34em] text-amber-300/78 sm:text-[11px]"
                  >
                    {{ formatPhotoDate(serie.date) }}
                  </p>
                  <div
                    class="mt-2 h-px w-9 bg-amber-300/70 transition-all duration-500 group-hover:w-14"
                  />
                  <p
                    class="mt-3 max-w-[11ch] text-balance font-display text-xl uppercase leading-[0.92] text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.38)] sm:text-[1.7rem]"
                  >
                    {{ serie.title }}
                  </p>
                </div>
              </div>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/galerie"
            class="group relative flex aspect-[4/5] flex-col justify-between border border-amber-200/20 bg-stone-950 p-4 text-amber-100 transition duration-300 hover:border-amber-200/50 hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:p-5"
          >
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/80">
              Galerie complète
            </p>

            <div>
              <h3 class="max-w-[12ch] font-display text-[1.55rem] uppercase leading-[0.9] text-white sm:text-[1.8rem]">
                Voir plus de séries
              </h3>
              <div class="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200">
                <span>Explorer</span>
                <span aria-hidden="true" class="transition duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </ContentList>
  </section>
</template>

<script setup lang="ts">
import type { QueryBuilderParams } from "@nuxt/content/types"
import { formatPhotoDate } from "../utils/photo-dates"
import { getSeriesCoverImage, getSeriesGalleryTiles } from "../utils/runs"
import type { RunLike, SeriesGalleryTile } from "../utils/runs"

const runQuery: QueryBuilderParams = {
  path: "/runs",
  limit: 15,
}

type HomeRun = RunLike & {
  slug: string
  title?: string
  date?: string
}

type HomeSeriesPreview = HomeRun & {
  previewImage: SeriesGalleryTile
}

const previewSeed = useState("runs-preview-seed", () => Math.random())

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

function shuffleSeries<T>(series: T[], seedLabel: string) {
  const shuffled = [...series]
  let seed = Array.from(`${seedLabel}-${previewSeed.value}`).reduce(
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

const getSeriesPreviewImage = (serie: HomeRun) => {
  const galleryTiles = getSeriesGalleryTiles(serie)
  const randomizedTile = shuffleSeries(galleryTiles, `series-preview-${serie.slug}`)[0]

  return (
    randomizedTile || {
      src: getSeriesCoverImage(serie),
      alt: serie.title || "",
    }
  )
}

const getHomepageSeries = (series: HomeRun[]) =>
  shuffleSeries(series, "homepage-series")
    .map((serie) => ({
      ...serie,
      previewImage: getSeriesPreviewImage(serie),
    }))
    .filter((serie): serie is HomeSeriesPreview => Boolean(serie.previewImage?.src))

</script>
