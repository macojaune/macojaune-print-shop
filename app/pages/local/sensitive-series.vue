<template>
  <div class="min-h-screen w-full px-4 pb-16 pt-4 lg:px-6">
    <div class="mx-auto max-w-[1780px]">
      <header class="mb-8 border-b border-amber-200/10 pb-5 lg:mb-10">
        <NuxtLink
          to="/galerie"
          class="inline-flex min-h-11 items-center py-2 text-xs uppercase tracking-[0.3em] text-stone-400 transition hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          Retour à la galerie
        </NuxtLink>

        <div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              Outil local uniquement
            </p>
            <h1 class="mt-2 font-display text-4xl uppercase leading-[0.92] text-amber-200 sm:text-5xl lg:text-6xl">
              Modération des images sensibles
            </h1>
            <p class="mt-3 max-w-[58ch] text-sm leading-6 text-stone-300">
              Parcours les séries et marque les photos sensibles. Le toggle met à jour
              <code class="rounded bg-stone-900/90 px-1 py-0.5 text-xs text-stone-200">sensitiveImages</code>
              dans le markdown de la série.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex min-h-11 w-fit items-center border border-amber-300/18 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-amber-100 transition hover:border-amber-200/35 hover:bg-amber-300/16 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            @click="refreshRuns"
          >
            Recharger les séries
          </button>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside class="space-y-4 border border-white/10 bg-stone-950/60 p-4 lg:sticky lg:top-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-auto">
          <label class="block">
            <span class="text-[10px] uppercase tracking-[0.32em] text-stone-400">
              Rechercher une série
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Nom, slug, année"
              class="mt-2 w-full border border-white/12 bg-black/50 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-300/45 focus:outline-none"
            >
          </label>

          <div class="space-y-2">
            <button
              v-for="run in filteredRuns"
              :key="`run-${run.slug}`"
              type="button"
              :class="[
                selectedSlug === run.slug
                  ? 'border-amber-300/35 bg-amber-300/12 text-amber-100'
                  : 'border-white/10 bg-stone-950/50 text-stone-300 hover:border-white/20 hover:text-stone-100',
              ]"
              class="w-full border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              @click="selectRun(run.slug)"
            >
              <div class="flex items-start justify-between gap-3">
                <p class="min-w-0 truncate font-medium">
                  {{ run.title || run.slug }}
                </p>
                <span class="text-[10px] uppercase tracking-[0.24em] text-stone-400">
                  {{ getSeriesYear(run.date) }}
                </span>
              </div>
              <p class="mt-1 text-xs uppercase tracking-[0.22em] text-stone-500">
                {{ getSeriesGalleryTiles(run).length }} photos · {{ getSensitiveCount(run) }} sensibles
              </p>
            </button>
          </div>
        </aside>

        <section v-if="selectedRun" class="space-y-5">
          <div class="flex flex-col gap-4 border border-white/10 bg-stone-950/40 p-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p v-if="selectedRun.date" class="text-[10px] uppercase tracking-[0.34em] text-amber-300/75">
                {{ formatPhotoDate(selectedRun.date) }}
              </p>
              <h2 class="mt-2 font-display text-3xl uppercase leading-[0.92] text-white sm:text-4xl">
                {{ selectedRun.title || selectedRun.slug }}
              </h2>
              <p class="mt-2 text-sm text-stone-300">
                {{ tiles.length }} images · {{ sensitiveCount }} sensibles
              </p>
            </div>

            <div
              v-if="feedbackMessage"
              class="inline-flex min-h-11 items-center border border-emerald-400/20 bg-emerald-300/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200"
            >
              {{ feedbackMessage }}
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <article
              v-for="tile in tiles"
              :key="tile.src"
              :class="isSensitive(tile.src) ? 'border-rose-300/35' : 'border-white/10'"
              class="relative overflow-hidden border bg-stone-950"
            >
              <RunImage
                :src="tile.src"
                :alt="tile.alt || selectedRun.title || selectedRun.slug"
                variant="detail"
                sizes="(max-width: 639px) 100vw, (max-width: 1535px) 50vw, 25vw"
                loading="lazy"
                fetchpriority="low"
                class="aspect-[4/5] w-full object-cover"
              />

              <div
                v-if="isSensitive(tile.src)"
                class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(136,19,55,0.06),rgba(136,19,55,0.38))]"
              />

              <div class="absolute inset-x-0 bottom-0 p-3">
                <button
                  type="button"
                  :disabled="isPending(tile.src)"
                  :class="isSensitive(tile.src) ? 'border-rose-200/40 bg-rose-300/20 text-rose-100' : 'border-white/25 bg-black/55 text-stone-100 hover:border-amber-300/45 hover:text-amber-100'"
                  class="inline-flex min-h-10 items-center border px-3 py-2 text-xs uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50"
                  @click="toggleSensitive(tile.src)"
                >
                  <span v-if="isPending(tile.src)">Sauvegarde…</span>
                  <span v-else>{{ isSensitive(tile.src) ? "Sensible" : "Marquer sensible" }}</span>
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-else class="border border-white/10 bg-stone-950/40 p-5 text-sm text-stone-300">
          Aucune série sélectionnée.
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatPhotoDate } from "../../utils/photo-dates"
import { getRunEntries } from "../../composables/useContentCollections"
import { getSeriesGalleryTiles } from "../../utils/runs"
import type { RunLike, SeriesGalleryTile } from "../../utils/runs"

if (!import.meta.dev) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page introuvable",
  })
}

definePageMeta({
  layout: "default",
})

type ModerationRun = RunLike & {
  slug: string
  title?: string
  date?: string | null
  sensitiveImages?: string[]
}

const route = useRoute()
const router = useRouter()

const searchQuery = ref("")
const selectedSlug = ref("")
const feedbackMessage = ref("")
const pendingSources = ref<string[]>([])

const { data: runs, refresh: refreshRuns } = await useAsyncData<ModerationRun[]>(
  "local-sensitive-runs",
  async () => {
    const entries = await getRunEntries()
    return entries.filter((entry): entry is ModerationRun => Boolean(entry.slug))
  },
)

const normalizeStorageSrc = (value?: string) => {
  if (!value) {
    return ""
  }

  let normalized = value.trim()
  if (!normalized) {
    return ""
  }

  if (/^https?:\/\//i.test(normalized)) {
    try {
      normalized = new URL(normalized).pathname || normalized
    } catch {
      // Keep original value when URL parsing fails.
    }
  }

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

const toTimestamp = (value?: string | null) => {
  const parsed = new Date(value || "").getTime()
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed
}

const getSeriesYear = (value?: string | null) => {
  const parsedDate = new Date(value || "")
  return Number.isNaN(parsedDate.getTime()) ? "Sans date" : String(parsedDate.getFullYear())
}

const getSensitiveCount = (run: ModerationRun) =>
  Array.isArray(run.sensitiveImages) ? run.sensitiveImages.filter(Boolean).length : 0

const sortedRuns = computed(() =>
  [...(runs.value || [])].sort((left, right) => toTimestamp(right.date) - toTimestamp(left.date)),
)

const filteredRuns = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return sortedRuns.value
  }

  return sortedRuns.value.filter((run) => {
    const year = getSeriesYear(run.date).toLowerCase()
    return (
      String(run.title || "").toLowerCase().includes(query) ||
      String(run.slug || "").toLowerCase().includes(query) ||
      year.includes(query)
    )
  })
})

watch(
  () => route.query.slug,
  (value) => {
    if (typeof value === "string" && value.trim()) {
      selectedSlug.value = value
    }
  },
  { immediate: true },
)

watch(
  filteredRuns,
  (entries) => {
    if (!entries.length) {
      selectedSlug.value = ""
      return
    }

    if (!entries.some((entry) => entry.slug === selectedSlug.value)) {
      selectedSlug.value = entries[0]?.slug || ""
    }
  },
  { immediate: true },
)

const selectedRun = computed(
  () => filteredRuns.value.find((run) => run.slug === selectedSlug.value) || null,
)

const sensitiveSet = computed(() =>
  new Set(
    (selectedRun.value?.sensitiveImages || [])
      .map((entry) => normalizeStorageSrc(entry))
      .filter(Boolean),
  ),
)

const tiles = computed<SeriesGalleryTile[]>(() =>
  selectedRun.value ? getSeriesGalleryTiles(selectedRun.value) : [],
)

const sensitiveCount = computed(() =>
  tiles.value.reduce((total, tile) => total + (isSensitive(tile.src) ? 1 : 0), 0),
)

const isPending = (src: string) => pendingSources.value.includes(normalizeStorageSrc(src))
const isSensitive = (src: string) => sensitiveSet.value.has(normalizeStorageSrc(src))

const setPending = (src: string, pending: boolean) => {
  const normalizedSrc = normalizeStorageSrc(src)

  if (!normalizedSrc) {
    return
  }

  const current = new Set(pendingSources.value)
  if (pending) {
    current.add(normalizedSrc)
  } else {
    current.delete(normalizedSrc)
  }

  pendingSources.value = Array.from(current)
}

const selectRun = async (slug: string) => {
  selectedSlug.value = slug
  await router.replace({
    query: {
      ...route.query,
      slug,
    },
  })
}

const toggleSensitive = async (src: string) => {
  const run = selectedRun.value

  if (!run?.slug) {
    return
  }

  const normalizedSrc = normalizeStorageSrc(src)
  if (!normalizedSrc) {
    return
  }

  const nextSensitiveValue = !isSensitive(src)
  setPending(src, true)
  feedbackMessage.value = ""

  try {
    await $fetch("/api/local/runs/sensitive", {
      method: "POST",
      body: {
        sensitive: nextSensitiveValue,
        slug: run.slug,
        src: normalizedSrc,
      },
    })

    await refreshRuns()
    feedbackMessage.value = nextSensitiveValue
      ? "Image marquée sensible"
      : "Marquage sensible retiré"
  } catch (error) {
    console.error(error)
    feedbackMessage.value = "Impossible de sauvegarder le marquage"
  } finally {
    setPending(src, false)
  }
}

useHead({
  title: "Modération locale des séries",
  meta: [
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
})
</script>
