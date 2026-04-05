<template>
  <div class="px-4 pb-16">
    <div class="mx-auto max-w-[1600px]">
      <section class="mb-10 pb-8 pt-4 lg:mb-14 lg:pb-10">
        <NuxtLink
          to="/galerie"
          class="inline-flex items-center text-xs uppercase tracking-[0.32em] text-amber-300/60 transition hover:text-amber-200"
        >
          Galerie
        </NuxtLink>

        <div class="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p v-if="serie.date" class="text-xs uppercase tracking-[0.38em] text-amber-300/60">
              {{ formatPhotoDate(serie.date) }}
            </p>
            <h1 class="mt-3 font-display text-5xl uppercase leading-none text-white lg:text-[6rem]">
              {{ serie.title }}
            </h1>
          </div>

          <ContentRenderer :value="serie" class="max-w-2xl text-sm leading-6 text-stone-300 lg:text-base" />
        </div>
      </section>

      <div class="columns-1 gap-4 sm:columns-2 xl:columns-3">
        <button
          v-for="tile in galleryTiles"
          :key="tile.src"
          type="button"
          class="group relative mb-4 block w-full break-inside-avoid overflow-hidden text-left"
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

    <Teleport to="body">
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="selectedTile" class="fixed inset-0 z-50" @click.self="closePhoto">
          <div class="absolute inset-0 bg-black/97 backdrop-blur-md" />

          <div class="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
            <div class="flex w-full max-w-[96vw] flex-col items-center">
              <button
                type="button"
                class="mb-4 self-end px-3 py-2 text-xs uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200"
                @click="closePhoto"
              >
                Fermer
              </button>

              <div class="mb-4 flex w-full max-w-[92vw] flex-col items-center text-center">
                <p class="font-display text-2xl text-white sm:text-3xl">
                  {{ serie.title }}
                </p>
                <p v-if="serie.date" class="mt-2 text-[11px] uppercase tracking-[0.3em] text-amber-300/75">
                  {{ formatPhotoDate(serie.date) }}
                </p>
              </div>

              <div class="flex w-full justify-center">
                <RunImage
                  :src="selectedTile.src"
                  :alt="selectedTile.alt || serie.title"
                  variant="detail"
                  sizes="92vw"
                  loading="eager"
                  fetchpriority="high"
                  class="max-h-[calc(100vh-14rem)] w-auto max-w-[92vw] object-contain"
                />
              </div>

              <div
                v-if="galleryTiles.length > 1"
                class="mt-4 flex w-full max-w-[92vw] items-center justify-between gap-6"
              >
                <button
                  type="button"
                  class="px-0 py-2 text-xs uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200"
                  @click.stop="showPreviousPhoto"
                >
                  Précédente
                </button>

                <button
                  type="button"
                  class="px-0 py-2 text-xs uppercase tracking-[0.3em] text-stone-300 transition hover:text-amber-200"
                  @click.stop="showNextPhoto"
                >
                  Suivante
                </button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { formatPhotoDate } from "../../../utils/photo-dates"
import {
  getRunImageUrl,
  getSeriesCoverImage,
  getSeriesGalleryTiles,
  getSeriesHeroImage,
} from "../../../utils/runs"
import { toAbsoluteUrl } from "../../../utils/run-media"

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
const galleryTiles = getSeriesGalleryTiles(serie)
const socialImage = getRunImageUrl(heroImage || coverImage, "social")
const socialImageUrl = toAbsoluteUrl(socialImage, "https://macojaune.com")
const title = "Série photo " + serie.title + " - Macojaune.com"

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
    const fromRoute = getRoutePhotoSrc()

    if (fromRoute) {
        resolvedRoutePhotoSrc.value = fromRoute
        return
    }

    if (import.meta.client) {
        resolvedRoutePhotoSrc.value = normalizePhotoSrc(
            new URL(window.location.href).searchParams.get("photo") || "",
        )
        return
    }

    resolvedRoutePhotoSrc.value = ""
}

const selectedPhotoSrc = computed(
    () => pendingPhotoSrc.value || resolvedRoutePhotoSrc.value || normalizePhotoSrc(seriesPhotoNavigation.value),
)

const selectedIndex = computed(() =>
    galleryTiles.findIndex((tile) => normalizePhotoSrc(tile.src) === selectedPhotoSrc.value),
)

const selectedTile = computed(() =>
    selectedIndex.value >= 0 ? galleryTiles[selectedIndex.value] : null,
)

const updatePhotoQuery = async (src?: string) => {
    const nextQuery = { ...route.query }

    if (src) {
        nextQuery.photo = src
    } else {
        delete nextQuery.photo
    }

    await router.push({
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
    if (!galleryTiles.length || selectedIndex.value < 0) {
        return
    }

    const nextIndex = (selectedIndex.value - 1 + galleryTiles.length) % galleryTiles.length
    const nextSrc = galleryTiles[nextIndex]?.src || ""
    pendingPhotoSrc.value = normalizePhotoSrc(nextSrc)
    void updatePhotoQuery(nextSrc)
}

const showNextPhoto = () => {
    if (!galleryTiles.length || selectedIndex.value < 0) {
        return
    }

    const nextIndex = (selectedIndex.value + 1) % galleryTiles.length
    const nextSrc = galleryTiles[nextIndex]?.src || ""
    pendingPhotoSrc.value = normalizePhotoSrc(nextSrc)
    void updatePhotoQuery(nextSrc)
}

const onKeydown = (event: KeyboardEvent) => {
    if (!selectedTile.value) {
        return
    }

    if (event.key === "Escape") {
        void closePhoto()
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault()
        showPreviousPhoto()
    }

    if (event.key === "ArrowRight") {
        event.preventDefault()
        showNextPhoto()
    }
}

if (import.meta.client) {
    watch(selectedTile, (tile) => {
        document.body.style.overflow = tile ? "hidden" : ""
    }, { immediate: true })

    onMounted(() => {
        window.addEventListener("keydown", onKeydown)
    })

    onBeforeUnmount(() => {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", onKeydown)
    })
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
            content: serie.description,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: toSiteUrl(route.path) },
        { property: "og:title", content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: "og:description",
            content: serie.description,
        },
        { property: "og:image", content: socialImageUrl },
        {
            property: "twitter:card", content: "summary_large_image",
        },
        { property: "twitter:url", content: toSiteUrl(route.path) },
        { property: "twitter:title", content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: "twitter:description",
            content: serie.description,
        },
        { property: "twitter:image", content: socialImageUrl },
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
