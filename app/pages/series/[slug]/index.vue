<template>
  <div class="px-4 pb-16">
    <div class="mx-auto max-w-[1600px]">
      <section class="mb-10 pb-8 pt-4 lg:mb-14 lg:pb-10">
        <NuxtLink
          to="/galerie"
          data-umami-event="SeriesClick"
          data-umami-section="header"
          data-umami-label="Galerie"
          data-umami-content-type="run"
          :data-umami-content-slug="String(serie.slug || route.params.slug || '')"
          data-umami-surface="series_page"
          class="inline-flex min-h-11 items-center py-2 text-xs uppercase tracking-[0.32em] text-amber-300/60 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Galerie
        </NuxtLink>

        <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p v-if="serie.date" class="text-xs uppercase tracking-[0.38em] text-amber-300/60">
              {{ formatPhotoDate(serie.date) }}
            </p>
            <h1 class="mt-3 max-w-[13ch] text-balance font-display text-5xl uppercase leading-[0.92] text-white lg:text-[6rem]">
              {{ serie.title }}
            </h1>
            <p class="mt-4 text-[11px] uppercase tracking-[0.3em] text-stone-400">
              {{ galleryTiles.length }} photos
            </p>
          </div>

          <p
            v-if="serieDescription"
            class="max-w-2xl text-sm leading-6 text-stone-300 lg:text-base lg:leading-7"
          >
            {{ serieDescription }}
          </p>
        </div>
      </section>

      <section
        v-if="introNarrative"
        class="mb-10 border-t border-white/10 pt-6 lg:mb-12 lg:pt-8"
      >
        <div class="max-w-4xl">
          <ContentRenderer
            :value="introNarrative"
            class="text-base leading-8 text-stone-200 [&_p]:mb-5 [&_p:last-child]:mb-0"
          />
        </div>
      </section>

      <div class="space-y-10 lg:space-y-12">
        <section
          v-if="galleryInterlude"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12"
        >
          <template v-for="item in galleryFlowItems" :key="item.key">
            <button
              v-if="item.type === 'photo'"
              type="button"
              :aria-label="`Ouvrir la photo ${item.index + 1} de la série ${serie.title}`"
              data-umami-event="SeriesClick"
              data-umami-section="gallery_flow"
              :data-umami-label="`Photo ${item.index + 1}`"
              :data-umami-position="item.index + 1"
              data-umami-content-type="run"
              :data-umami-content-slug="String(serie.slug || route.params.slug || '')"
              data-umami-surface="series_page"
              class="group relative block overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :class="item.layoutClass"
              @click="openPhoto(item.tile.src)"
            >
              <RunImage
                :src="item.tile.src"
                :alt="item.tile.alt || serie.title"
                :sizes="item.sizes"
                variant="detail"
                itemprop="image"
                loading="lazy"
                fetchpriority="low"
                class="w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
              />
            </button>

            <div
              v-else
              class="px-4 py-5 lg:px-6 lg:py-7"
              :class="item.layoutClass"
            >
              <ContentRenderer
                :value="item.document"
                class="text-left text-[0.95rem] leading-7 text-stone-200/92 [&_p]:mb-0 [&_p]:max-w-none [&_strong]:font-semibold [&_strong]:text-amber-100"
                :class="item.variant === 'lead'
                  ? 'border-y border-amber-200/18 bg-amber-300/[0.06] text-[1rem] leading-8 lg:text-[1.02rem]'
                  : 'border-y border-white/10 bg-stone-950/35'"
              />
            </div>
          </template>
        </section>

        <div v-else class="columns-1 gap-4 sm:columns-2 xl:columns-3">
          <a
            v-if="wallpaperPackUrl"
            :href="wallpaperPackUrl"
            download
            data-umami-event="SeriesClick"
            data-umami-section="wallpaper_pack"
            data-umami-label="Pack de fond d'écran"
            data-umami-content-type="run"
            :data-umami-content-slug="String(serie.slug || route.params.slug || '')"
            data-umami-surface="series_page"
            class="group relative mb-4 flex min-h-[19rem] break-inside-avoid flex-col justify-end overflow-hidden border border-amber-200/12 bg-stone-950 p-5 text-left transition duration-500 hover:border-amber-200/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.18)_0%,rgba(12,10,9,0.62)_58%,rgba(12,10,9,0.96)_100%)]" />
            <div class="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_68%)] opacity-70 transition duration-500 group-hover:opacity-100" />
            <div class="relative z-10">
              <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
                À emporter
              </p>
              <h2 class="mt-3 font-display text-[2rem] uppercase leading-[0.96] text-white sm:text-[2.4rem]">
                Pack de fond d'écran
              </h2>
              <p class="mt-4 text-sm leading-6 text-stone-300">
                Télécharge gratuitement une sélection de photos de cette série pour décorer ton smartphone.
              </p>
              <div class="mt-6 ml-auto inline-flex items-center gap-3 border border-amber-300/18 bg-amber-300/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-amber-100 transition duration-300 group-hover:border-amber-200/34 group-hover:bg-amber-300/16 group-hover:text-amber-200">
                <span>Télécharger</span>
                <span aria-hidden="true" class="text-base leading-none">→</span>
              </div>
            </div>
          </a>

          <button
            v-for="(tile, index) in galleryTiles"
            :key="tile.src"
            type="button"
            :aria-label="`Ouvrir la photo ${index + 1} de la série ${serie.title}`"
            data-umami-event="SeriesClick"
            data-umami-section="gallery"
            :data-umami-label="`Photo ${index + 1}`"
            :data-umami-position="index + 1"
            data-umami-content-type="run"
            :data-umami-content-slug="String(serie.slug || route.params.slug || '')"
            data-umami-surface="series_page"
            class="group relative mb-4 block w-full break-inside-avoid overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="openPhoto(tile.src)"
          >
            <RunImage
              :src="tile.src"
              :alt="tile.alt || serie.title"
              sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
              variant="detail"
              itemprop="image"
              loading="lazy"
              fetchpriority="low"
              class="w-full object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
            />
          </button>
        </div>
      </div>

      <section
        v-if="suggestedSeries.length"
        class="mt-14 border-t border-white/10 pt-8 lg:mt-16 lg:pt-10"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              Continuer l’exploration
            </p>
            <h2 class="mt-2 font-display text-3xl uppercase leading-[0.95] text-white sm:text-4xl">
              Découvrir d’autres séries
            </h2>
          </div>

          <NuxtLink
            to="/galerie"
            data-umami-event="SeriesClick"
            data-umami-section="suggestions"
            data-umami-label="Voir toute la galerie"
            data-umami-content-type="run"
            :data-umami-content-slug="String(serie.slug || route.params.slug || '')"
            data-umami-surface="series_page"
            class="inline-flex min-h-11 w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-amber-200 transition hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Voir toute la galerie
          </NuxtLink>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NuxtLink
            v-for="suggestion in suggestedSeries"
            :key="`suggested-${suggestion.slug}`"
            :to="`/series/${suggestion.slug}`"
            data-umami-event="SeriesClick"
            data-umami-section="suggestions"
            :data-umami-label="suggestion.title"
            :data-umami-content-slug="suggestion.slug"
            data-umami-content-type="run"
            data-umami-surface="series_page"
            class="group relative block min-h-[18rem] overflow-hidden border border-white/10 bg-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <RunImage
              :src="suggestion.coverImage"
              :alt="suggestion.title"
              variant="card"
              sizes="(max-width: 639px) 100vw, 50vw"
              loading="lazy"
              fetchpriority="low"
              class="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            />

            <div class="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-black/10" />

            <div class="relative z-10 flex h-full flex-col justify-end p-5">
              <p
                v-if="suggestion.date"
                class="text-[10px] uppercase tracking-[0.34em] text-amber-300/78"
              >
                {{ formatPhotoDate(suggestion.date) }}
              </p>
              <h3 class="mt-3 max-w-[12ch] text-balance font-display text-[2rem] uppercase leading-[0.95] text-white sm:text-[2.3rem]">
                {{ suggestion.title }}
              </h3>
              <p class="mt-4 text-[11px] uppercase tracking-[0.28em] text-stone-300/78">
                {{ suggestion.photoCount }} {{ suggestion.photoCount > 1 ? "photos" : "photo" }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>

    <SeriesLightbox
      :tile="selectedTile"
      :series-title="serie.title || 'Série photo'"
      :series-slug="String(serie.slug || route.params.slug || '')"
      :series-date-label="seriesDateLabel"
      :position-label="selectedPositionLabel"
      :can-navigate="galleryTiles.length > 1"
      @close="closePhoto"
      @previous="showPreviousPhoto"
      @next="showNextPhoto"
    />
  </div>
</template>

<script lang="ts" setup>
import { formatPhotoDate } from "../../../utils/photo-dates"
import { getRunEntries } from "../../../composables/useContentCollections"
import {
  getRunImageUrl,
  getSeriesCoverImage,
  getSeriesGalleryTiles,
  getSeriesHeroImage,
} from "../../../utils/runs"
import type { RunLike, SeriesGalleryTile } from "../../../utils/runs"
import { toAbsoluteUrl } from "../../../utils/run-media"
import type { ParsedContentv2 } from "@nuxt/content"

const { toSiteUrl } = useAssetUrls()
const route = useRoute()
const router = useRouter()
const seriesPhotoNavigation = useState("series-photo-navigation", () => "")

definePageMeta({
    layout: "default",
})

const serie = await queryContent("runs").where({ slug: route.params.slug }).findOne()

if (!serie) {
    throw createError({
        statusCode: 404,
        statusMessage: "Série introuvable",
    })
}

const coverImage = getSeriesCoverImage(serie)
const heroImage = getSeriesHeroImage(serie)
const shuffleGalleryTiles = <Tile,>(tiles: Tile[]) => {
    const shuffled = [...tiles]

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
        const currentValue = shuffled[index]
        shuffled[index] = shuffled[swapIndex] as Tile
        shuffled[swapIndex] = currentValue as Tile
    }

    return shuffled
}

const baseGalleryTiles = getSeriesGalleryTiles(serie)
const galleryTiles = useState<SeriesGalleryTile[]>(
    `series-gallery-order:${String(serie.slug || route.params.slug || "")}`,
    () => shuffleGalleryTiles(baseGalleryTiles),
)

if (
    galleryTiles.value.length !== baseGalleryTiles.length
    || galleryTiles.value.some((tile) => !baseGalleryTiles.find((entry) => entry.src === tile.src))
) {
    galleryTiles.value = shuffleGalleryTiles(baseGalleryTiles)
}

const allSeries = await getRunEntries()
const description = typeof serie.description === "string" && serie.description.trim()
    ? serie.description
    : `Découvre la série photo ${serie.title} sur Macojaune.`
const wallpaperPackUrl = typeof serie.wallpaperPackUrl === "string" ? serie.wallpaperPackUrl : ""
const socialImage = getRunImageUrl(heroImage || coverImage, "social")
const socialImageUrl = toAbsoluteUrl(socialImage, "https://macojaune.com")
const title = "Série photo " + serie.title + " - Macojaune.com"
const seriesDateLabel = computed(() => (serie.date ? formatPhotoDate(serie.date) : ""))
const serieDescription = computed(() =>
    typeof serie.description === "string" && serie.description.trim() ? serie.description.trim() : "",
)

type MarkdownDocument = Pick<ParsedContentv2, "body">
type GalleryTile = SeriesGalleryTile
type GalleryFlowPhotoItem = {
    key: string
    type: "photo"
    tile: GalleryTile
    index: number
    layoutClass: string
    sizes: string
}
type GalleryFlowTextItem = {
    key: string
    type: "text"
    document: MarkdownDocument
    variant: "lead" | "body"
    layoutClass: string
}
type GalleryFlowItem = GalleryFlowPhotoItem | GalleryFlowTextItem

const narrativeState = useState<{ intro: MarkdownDocument | null, interlude: MarkdownDocument | null }>(
    `series-narrative:${String(serie.slug || route.params.slug || "")}`,
    () => ({ intro: null, interlude: null }),
)

if (import.meta.server) {
    const { getRunNarrativeDocuments } = await import("../../../server/utils/run-narrative")
    narrativeState.value = await getRunNarrativeDocuments(String(serie.slug || route.params.slug || ""))
}

const introNarrative = computed(() => narrativeState.value.intro)
const galleryInterlude = computed(() => narrativeState.value.interlude)
const galleryNarrativeBlocks = computed<MarkdownDocument[]>(() => {
    const children = galleryInterlude.value?.body?.children

    if (!Array.isArray(children) || !children.length) {
        return []
    }

    return children.map((child) => ({
        body: {
            type: "root",
            children: [child],
        },
    }))
})

const getMarkdownText = (document: MarkdownDocument) => {
    const extractText = (node: unknown): string => {
        if (!node || typeof node !== "object") {
            return ""
        }

        const currentNode = node as { value?: string, children?: unknown[] }
        const value = typeof currentNode.value === "string" ? currentNode.value : ""
        const childrenText = Array.isArray(currentNode.children)
            ? currentNode.children.map((child) => extractText(child)).join(" ")
            : ""

        return [value, childrenText].filter(Boolean).join(" ").trim()
    }

    return extractText(document.body).replace(/\s+/g, " ").trim()
}

const getTextWordCount = (document: MarkdownDocument) => {
    const text = getMarkdownText(document)

    if (!text) {
        return 0
    }

    return text.split(/\s+/).filter(Boolean).length
}

const getTextLayoutClass = (document: MarkdownDocument, blockIndex: number) => {
    const wordCount = getTextWordCount(document)

    if (blockIndex === 0) {
        return "md:col-span-2 xl:col-span-5 xl:col-start-1"
    }

    if (wordCount >= 130) {
        return blockIndex % 2 === 0 ? "md:col-span-2 xl:col-span-5" : "md:col-span-2 xl:col-span-4"
    }

    if (wordCount >= 80) {
        return blockIndex % 2 === 0 ? "md:col-span-1 xl:col-span-4" : "md:col-span-2 xl:col-span-4"
    }

    return blockIndex % 2 === 0 ? "md:col-span-1 xl:col-span-3" : "md:col-span-1 xl:col-span-4"
}

const getPhotoLayoutClass = (tile: GalleryTile, index: number) => {
    const signature = hashString(`${tile.src}:${tile.orientation || "unknown"}:${index}`)

    if (tile.orientation === "landscape") {
        return signature % 5 === 0 ? "md:col-span-2 xl:col-span-8" : "md:col-span-1 xl:col-span-4"
    }

    if (tile.orientation === "portrait") {
        return signature % 4 === 0 ? "md:col-span-1 xl:col-span-3" : "md:col-span-1 xl:col-span-4"
    }

    if (signature % 6 === 0) {
        return "md:col-span-2 xl:col-span-6"
    }

    return "md:col-span-1 xl:col-span-4"
}

const getPhotoSizes = (layoutClass: string) => {
    if (layoutClass.includes("xl:col-span-8")) {
        return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 66vw"
    }

    if (layoutClass.includes("xl:col-span-6")) {
        return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 50vw"
    }

    if (layoutClass.includes("xl:col-span-3")) {
        return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
    }

    return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
}

const galleryNarrativeAnchors = computed<number[]>(() => {
    const blockCount = galleryNarrativeBlocks.value.length

    if (!blockCount || !galleryTiles.value.length) {
        return []
    }

    const anchors: number[] = []
    const baseOffset = Math.min(galleryTiles.value.length, 2)
    const remainingBlocks = blockCount - 1
    anchors.push(baseOffset)

    for (let index = 0; index < remainingBlocks; index += 1) {
        const progress = remainingBlocks === 0 ? 1 : (index + 1) / remainingBlocks
        const rawAnchor = baseOffset + Math.round((galleryTiles.value.length - baseOffset) * progress)
        const previousAnchor = anchors[anchors.length - 1] || 0
        anchors.push(Math.min(galleryTiles.value.length, Math.max(previousAnchor + 1, rawAnchor)))
    }

    return anchors
})

const galleryFlowItems = computed<GalleryFlowItem[]>(() => {
    if (!galleryInterlude.value) {
        return []
    }

    const items: GalleryFlowItem[] = []
    let textIndex = 0

    galleryTiles.value.forEach((tile, photoIndex) => {
        const layoutClass = getPhotoLayoutClass(tile, photoIndex)

        items.push({
            key: tile.src,
            type: "photo",
            tile,
            index: photoIndex,
            layoutClass,
            sizes: getPhotoSizes(layoutClass),
        })

        while (
            textIndex < galleryNarrativeBlocks.value.length
            && photoIndex + 1 >= (galleryNarrativeAnchors.value[textIndex] || 0)
        ) {
            const block = galleryNarrativeBlocks.value[textIndex]

            items.push({
                key: `text-${textIndex}`,
                type: "text",
                document: block,
                variant: textIndex === 0 ? "lead" : "body",
                layoutClass: getTextLayoutClass(block, textIndex),
            })
            textIndex += 1
        }
    })

    while (textIndex < galleryNarrativeBlocks.value.length) {
        const block = galleryNarrativeBlocks.value[textIndex]

        items.push({
            key: `text-${textIndex}`,
            type: "text",
            document: block,
            variant: textIndex === 0 ? "lead" : "body",
            layoutClass: getTextLayoutClass(block, textIndex),
        })
        textIndex += 1
    }

    return items
})

const normalizePhotoSrc = (value?: string) => {
    if (!value) {
        return ""
    }

    let normalized = value.trim()

    for (let index = 0; index < 2; index += 1) {
        try {
            const decoded = decodeURIComponent(normalized)

            if (decoded === normalized) {
                break
            }

            normalized = decoded
        } catch {
            break
        }
    }

    return normalized
}

const getRoutePhotoSrc = () => {
    const value = route.query.photo

    if (typeof value === "string") {
        return normalizePhotoSrc(value)
    }

    if (Array.isArray(value)) {
        return normalizePhotoSrc(value[0] || "")
    }

    return ""
}

const pendingPhotoSrc = ref("")
const resolvedRoutePhotoSrc = ref("")

const syncResolvedRoutePhotoSrc = () => {
    resolvedRoutePhotoSrc.value = getRoutePhotoSrc()
}

const selectedPhotoSrc = computed(
    () => pendingPhotoSrc.value || resolvedRoutePhotoSrc.value || normalizePhotoSrc(seriesPhotoNavigation.value),
)

const selectedIndex = computed(() =>
    galleryTiles.value.findIndex((tile) => normalizePhotoSrc(tile.src) === selectedPhotoSrc.value),
)

const selectedTile = computed(() =>
    selectedIndex.value >= 0 ? galleryTiles.value[selectedIndex.value] : null,
)

const selectedPositionLabel = computed(() => {
    if (selectedIndex.value < 0 || !galleryTiles.value.length) {
        return ""
    }

    return `${selectedIndex.value + 1} / ${galleryTiles.value.length}`
})

type SuggestedSeries = {
    slug: string
    title: string
    date?: string | null
    coverImage: string
    photoCount: number
}

const hashString = (value: string) => {
    let hash = 0

    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0
    }

    return hash
}

const suggestedSeries = computed<SuggestedSeries[]>(() => {
    const currentSlug = typeof route.params.slug === "string" ? route.params.slug : String(route.params.slug?.[0] || "")

    return allSeries
        .filter((entry) => entry.slug && entry.slug !== currentSlug)
        .map((entry) => {
            const tiles = getSeriesGalleryTiles(entry as RunLike)
            const cover = getSeriesCoverImage(entry as RunLike)

            return {
                slug: entry.slug,
                title: String(entry.title || "Série photo"),
                date: typeof entry.date === "string" ? entry.date : null,
                coverImage: cover,
                photoCount: tiles.length,
                score: hashString(`${currentSlug}:${entry.slug}`),
            }
        })
        .filter((entry) => Boolean(entry.coverImage))
        .sort((left, right) => left.score - right.score)
        .slice(0, 2)
        .map(({ score, ...entry }) => entry)
})

const updatePhotoQuery = async (src?: string) => {
    const nextQuery = { ...route.query }

    if (src) {
        nextQuery.photo = src
    } else {
        delete nextQuery.photo
    }

    await router.replace({
        path: route.path,
        query: nextQuery,
    })
}

watch(resolvedRoutePhotoSrc, (value) => {
    if (!value || value === pendingPhotoSrc.value) {
        pendingPhotoSrc.value = ""
    }

    if (value) {
        seriesPhotoNavigation.value = ""
    }
}, { immediate: true })

watch(
    () => route.fullPath,
    () => {
        syncResolvedRoutePhotoSrc()
    },
    { immediate: true },
)

onMounted(() => {
    syncResolvedRoutePhotoSrc()
})

const openPhoto = (src: string) => {
    pendingPhotoSrc.value = normalizePhotoSrc(src)
    void updatePhotoQuery(src)
}

const closePhoto = () => {
    pendingPhotoSrc.value = ""
    seriesPhotoNavigation.value = ""
    void updatePhotoQuery()
}

const showPreviousPhoto = () => {
    if (!galleryTiles.value.length || selectedIndex.value < 0) {
        return
    }

    const nextIndex = (selectedIndex.value - 1 + galleryTiles.value.length) % galleryTiles.value.length
    const nextSrc = galleryTiles.value[nextIndex]?.src || ""
    pendingPhotoSrc.value = normalizePhotoSrc(nextSrc)
    void updatePhotoQuery(nextSrc)
}

const showNextPhoto = () => {
    if (!galleryTiles.value.length || selectedIndex.value < 0) {
        return
    }

    const nextIndex = (selectedIndex.value + 1) % galleryTiles.value.length
    const nextSrc = galleryTiles.value[nextIndex]?.src || ""
    pendingPhotoSrc.value = normalizePhotoSrc(nextSrc)
    void updatePhotoQuery(nextSrc)
}

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
        { property: "og:url", content: toSiteUrl(route.path) },
        { property: "og:title", content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: "og:description",
            content: description,
        },
        { property: "og:image", content: socialImageUrl },
        {
            property: "twitter:card", content: "summary_large_image",
        },
        { property: "twitter:url", content: toSiteUrl(route.path) },
        { property: "twitter:title", content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: "twitter:description",
            content: description,
        },
        { property: "twitter:image", content: socialImageUrl },
    ],
    link: [
        {
            rel: "canonical",
            href: toSiteUrl(route.path),
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
                            "@id": "https://macojaune.com",
                            name: "Homepage",
                        },
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        item: {
                            "@id": "https://macojaune.com" + route.path,
                            name: serie.title,
                        },
                    },
                ],
            }),
        },
    ],
})
</script>
