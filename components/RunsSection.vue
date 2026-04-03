<template>
  <section>
    <h2 class="mb-8 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
      Mes photos
    </h2>
    <ContentList v-slot="{ list }" :query="runQuery">
      <div class="mb-2 flex flex-col gap-8">
        <div v-for="serie in list" :key="serie.slug">
          <NuxtLink :to="`/series/${serie.slug}`" class="group">
            <h4 class="font-display text-4xl text-white group-hover:text-amber-600">
              <span class="font-sans text-xl text-amber-500">Série:</span> {{ serie.title }}
              <small v-if="serie.date" class="text-sm font-sans">{{ formatPhotoDate(serie.date) }}</small>
            </h4>
          </NuxtLink>
          <div class="mt-4 flex flex-col gap-4">
            <div class="flex w-full flex-col">
              <p class="font-sans">{{ serie.description }}</p>
            </div>
            <div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-1">
              <NuxtLink
                v-for="image in getRandomSeriesImages(serie)"
                :key="`${serie.slug}-${image.src}`"
                :to="{ path: `/series/${serie.slug}`, query: { photo: image.src } }"
              >
                <div class="aspect-[4/5] overflow-hidden">
                  <RunImage
                    :src="image.src"
                    :alt="image.alt || serie.title"
                    variant="thumb"
                    sizes="(max-width: 1023px) 33vw, 16vw"
                    class="h-full w-full object-cover"
                  />
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
        <div class="mt-8 flex w-full justify-center">
          <NuxtLink class="bg-amber-400 p-3 font-bold text-black hover:text-amber-600" to="/galerie">
            Voir toutes les séries
          </NuxtLink>
        </div>
      </div>
    </ContentList>
  </section>
</template>

<script setup lang="ts">
import type { QueryBuilderParams } from "@nuxt/content/types"
import { formatPhotoDate } from "../utils/photo-dates"
import { getSeriesGalleryTiles } from "../utils/runs"
import type { RunLike, SeriesGalleryTile } from "../utils/runs"

const runQuery: QueryBuilderParams = {
  path: "/runs",
  limit: 3,
  sort: { date: -1 },
}

type HomeRun = RunLike & {
  slug: string
  description?: string
  date?: string
}

const previewSeed = useState("runs-preview-seed", () => Math.random())

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const shuffleTiles = (tiles: SeriesGalleryTile[], seedBase: string) => {
  const shuffled = [...tiles]
  let seed = Array.from(`${seedBase}-${previewSeed.value}`).reduce(
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

const getRandomSeriesImages = (serie: HomeRun) =>
  shuffleTiles(getSeriesGalleryTiles(serie), serie.slug).slice(0, 6)
</script>
