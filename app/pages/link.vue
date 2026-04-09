<template>
  <section class="links-page px-4 pb-12">
    <div class="mx-auto flex w-full max-w-[32rem] flex-col gap-3 lg:max-w-[72rem] lg:gap-4">
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          v-for="social in socialLinks"
          :key="social.href"
          :href="social.href"
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="LinkHubClick"
          data-umami-section="social_links"
          :data-umami-label="social.label"
          data-umami-surface="link_page"
          class="inline-flex min-h-11 items-center justify-between border border-white/10 bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-stone-100 transition hover:border-amber-300/35 hover:bg-amber-300/10 hover:text-amber-100"
        >
          <span>{{ social.label }}</span>
          <span aria-hidden="true" class="text-sm leading-none text-amber-300/80">↗</span>
        </a>
      </div>

      <div class="hidden lg:block border border-white/10 bg-stone-950/45 px-4 py-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              À propos
            </p>
            <p class="mt-2 text-sm leading-6 text-stone-200">
              {{ aboutExcerpt }}
            </p>
          </div>

          <NuxtLink
            to="/a-propos"
            data-umami-event="LinkHubClick"
            data-umami-section="about_teaser"
            data-umami-label="En lire plus"
            data-umami-surface="link_page_desktop"
            class="inline-flex min-h-11 shrink-0 items-center border border-white/10 bg-black/25 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-100 transition hover:border-amber-300/35 hover:text-amber-50"
          >
            En lire plus
          </NuxtLink>
        </div>
      </div>

      <div class="grid gap-2.5 lg:grid-cols-2">
        <a
          v-for="(link, index) in decoratedLinks"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="LinkClick"
          data-umami-section="primary_links"
          :data-umami-label="link.text || 'Lien externe'"
          :data-umami-position="index + 1"
          data-umami-surface="link_page"
          class="group relative overflow-hidden border border-white/10 px-3.5 py-3 text-left transition duration-300 hover:-translate-y-0.5 hover:border-amber-300/32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:px-4 sm:py-3.5"
          :class="index === 0 ? 'min-h-[7.3rem] lg:min-h-[8.7rem]' : 'min-h-[6.1rem] lg:min-h-[7.1rem]'"
        >
          <div
            class="absolute inset-0 opacity-100 transition duration-300 group-hover:opacity-90"
            :style="{ background: link.background }"
          />
          <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.06),rgba(12,10,9,0.3)_46%,rgba(12,10,9,0.82))]" />

          <div class="relative z-10 flex h-full flex-col">
            <div class="mt-auto pt-1.5">
              <div class="flex items-end justify-between gap-3">
                <h3
                  class="font-display uppercase text-white"
                  :class="index === 0 ? 'text-[1.78rem] leading-[0.92] sm:text-[2.1rem]' : 'text-[1.42rem] leading-[0.94] sm:text-[1.7rem]'"
                >
                  {{ link.text }}
                </h3>
                <span
                  aria-hidden="true"
                  class="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-black/25 bg-black/30 text-sm text-amber-100 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-8 sm:w-8 sm:text-base"
                >
                  ↗
                </span>
              </div>

              <p
                v-if="link.description"
                class="mt-1.5 text-[0.88rem] leading-5 text-stone-100/88"
              >
                {{ link.description }}
              </p>
            </div>
          </div>
        </a>
      </div>

      <div class="space-y-3 lg:hidden">
        <section class="border border-white/10 bg-stone-950/35 px-3.5 py-4">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              Mes derniers clichés
            </p>
            <NuxtLink
              to="/galerie"
              data-umami-event="LinkHubClick"
              data-umami-section="gallery_highlights"
              data-umami-label="Voir plus"
              data-umami-surface="link_page_mobile"
              class="text-[10px] uppercase tracking-[0.24em] text-stone-300 transition hover:text-amber-100"
            >
              Voir plus
            </NuxtLink>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <NuxtLink
              v-for="(entry, index) in galleryHighlights"
              :key="`mobile-${entry.to}`"
              :to="entry.to"
              data-umami-event="LinkHubClick"
              data-umami-section="gallery_highlights"
              :data-umami-label="entry.title"
              :data-umami-position="index + 1"
              data-umami-content-type="run"
              :data-umami-content-slug="entry.slug"
              data-umami-surface="link_page_mobile"
              class="group relative aspect-square overflow-hidden border border-white/10 bg-stone-950"
            >
              <RunImage
                v-if="entry.image"
                :src="entry.image"
                :alt="entry.title"
                variant="card"
                sizes="50vw"
                loading="lazy"
                class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <div
                class="absolute inset-0"
                :class="entry.image ? 'bg-[linear-gradient(180deg,rgba(12,10,9,0.12),rgba(12,10,9,0.38)_40%,rgba(12,10,9,0.88))]' : 'bg-[linear-gradient(135deg,rgba(120,53,15,0.9),rgba(28,25,23,0.98))]'"
              />
              <div class="relative z-10 flex h-full items-end p-3">
                <div>
                  <p v-if="entry.meta" class="text-[10px] uppercase tracking-[0.22em] text-amber-200/82">
                    {{ entry.meta }}
                  </p>
                  <h3 class="mt-1 font-display text-base uppercase leading-[0.96] text-white">
                    {{ entry.title }}
                  </h3>
                </div>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section class="border border-white/10 bg-stone-950/35 px-3.5 py-4">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              Viens créer avec moi
            </p>
            <NuxtLink
              to="/projets"
              data-umami-event="LinkHubClick"
              data-umami-section="project_highlights"
              data-umami-label="Voir plus"
              data-umami-surface="link_page_mobile"
              class="text-[10px] uppercase tracking-[0.24em] text-stone-300 transition hover:text-amber-100"
            >
              Voir plus
            </NuxtLink>
          </div>

          <div class="mt-3 grid gap-2">
            <NuxtLink
              v-for="(entry, index) in projectHighlights"
              :key="`mobile-${entry.to}`"
              :to="entry.to"
              data-umami-event="LinkHubClick"
              data-umami-section="project_highlights"
              :data-umami-label="entry.title"
              :data-umami-position="index + 1"
              data-umami-content-type="project"
              :data-umami-content-slug="entry.slug"
              data-umami-surface="link_page_mobile"
              class="group relative min-h-[9rem] overflow-hidden border border-white/10 bg-stone-950"
            >
              <ProjectImage
                v-if="entry.image"
                :src="entry.image"
                :alt="entry.title"
                loading="lazy"
                class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div
                class="absolute inset-0"
                :class="entry.image ? 'bg-[linear-gradient(180deg,rgba(12,10,9,0.16),rgba(12,10,9,0.48)_42%,rgba(12,10,9,0.9))]' : 'bg-[linear-gradient(135deg,rgba(68,64,60,0.92),rgba(28,25,23,0.98))]'"
              />
              <div class="relative z-10 flex h-full flex-col justify-end p-3.5">
                <div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-amber-200/86">
                  <span v-if="entry.meta">{{ entry.meta }}</span>
                  <span v-if="entry.tags.length">·</span>
                  <span v-if="entry.tags.length">{{ entry.tags[0] }}</span>
                </div>
                <h3 class="mt-2 font-display text-[1.2rem] uppercase leading-[0.94] text-white">
                  {{ entry.title }}
                </h3>
              </div>
            </NuxtLink>
          </div>
        </section>

        <section class="border border-white/10 bg-stone-950/35 px-3.5 py-4">
          <div class="flex items-center justify-between gap-3">
            <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
              À propos
            </p>
            <NuxtLink
              to="/a-propos"
              data-umami-event="LinkHubClick"
              data-umami-section="about_teaser"
              data-umami-label="En lire plus"
              data-umami-surface="link_page_mobile"
              class="text-[10px] uppercase tracking-[0.24em] text-stone-300 transition hover:text-amber-100"
            >
              En lire plus
            </NuxtLink>
          </div>
          <p class="mt-2 text-sm leading-6 text-stone-200">
            {{ aboutExcerpt }}
          </p>
        </section>
      </div>

      <section class="hidden lg:block border border-white/10 bg-stone-950/35 px-4 py-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
            Mes derniers clichés
          </p>
          <NuxtLink
            to="/galerie"
            data-umami-event="LinkHubClick"
            data-umami-section="gallery_highlights"
            data-umami-label="Voir plus"
            data-umami-surface="link_page_desktop"
            class="text-[10px] uppercase tracking-[0.24em] text-stone-300 transition hover:text-amber-100"
          >
            Voir plus
          </NuxtLink>
        </div>

        <div class="mt-3 grid grid-cols-4 gap-2.5">
          <NuxtLink
            v-for="entry in galleryHighlights"
            :key="entry.to"
            :to="entry.to"
            data-umami-event="LinkHubClick"
            data-umami-section="gallery_highlights"
            :data-umami-label="entry.title"
            :data-umami-content-slug="entry.slug"
            data-umami-content-type="run"
            :data-umami-position="entry.position"
            data-umami-surface="link_page_desktop"
            class="group relative aspect-square overflow-hidden border border-white/10 bg-stone-950 transition hover:-translate-y-0.5 hover:border-amber-300/28"
          >
            <RunImage
              v-if="entry.image"
              :src="entry.image"
              :alt="entry.title"
              variant="card"
              sizes="(max-width: 1279px) 25vw, 18vw"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
            />
            <div
              class="absolute inset-0"
              :class="entry.image ? 'bg-[linear-gradient(180deg,rgba(12,10,9,0.14),rgba(12,10,9,0.38)_42%,rgba(12,10,9,0.88))]' : 'bg-[linear-gradient(135deg,rgba(120,53,15,0.9),rgba(28,25,23,0.98))]'"
            />
            <div class="relative z-10 flex h-full items-end p-3.5">
              <div>
                <p v-if="entry.meta" class="text-[10px] uppercase tracking-[0.24em] text-amber-200/82">
                  {{ entry.meta }}
                </p>
                <h3 class="mt-1 font-display text-[1.1rem] uppercase leading-[0.96] text-white">
                  {{ entry.title }}
                </h3>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="hidden lg:block border border-white/10 bg-stone-950/35 px-4 py-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/72">
            Viens créer avec moi
          </p>
          <NuxtLink
            to="/projets"
            data-umami-event="LinkHubClick"
            data-umami-section="project_highlights"
            data-umami-label="Voir plus"
            data-umami-surface="link_page_desktop"
            class="text-[10px] uppercase tracking-[0.24em] text-stone-300 transition hover:text-amber-100"
          >
            Voir plus
          </NuxtLink>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2.5">
          <NuxtLink
            v-for="entry in projectHighlights"
            :key="entry.to"
            :to="entry.to"
            data-umami-event="LinkHubClick"
            data-umami-section="project_highlights"
            :data-umami-label="entry.title"
            :data-umami-content-slug="entry.slug"
            data-umami-content-type="project"
            :data-umami-position="entry.position"
            data-umami-surface="link_page_desktop"
            class="group relative min-h-[11rem] overflow-hidden border border-white/10 bg-stone-950 transition hover:border-amber-300/28"
          >
            <ProjectImage
              v-if="entry.image"
              :src="entry.image"
              :alt="entry.title"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
            <div
              class="absolute inset-0"
              :class="entry.image ? 'bg-[linear-gradient(180deg,rgba(12,10,9,0.18),rgba(12,10,9,0.52)_42%,rgba(12,10,9,0.92))]' : 'bg-[linear-gradient(135deg,rgba(68,64,60,0.92),rgba(28,25,23,0.98))]'"
            />
            <div class="relative z-10 flex h-full flex-col justify-end p-3.5">
              <div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-amber-200/86">
                <span v-if="entry.meta">{{ entry.meta }}</span>
                <span v-if="entry.tags.length">·</span>
                <span v-if="entry.tags.length">{{ entry.tags[0] }}</span>
              </div>
              <h3 class="mt-2 font-display text-[1.5rem] uppercase leading-[0.94] text-white">
                {{ entry.title }}
              </h3>
              <p v-if="entry.description" class="mt-1.5 text-sm leading-5 text-stone-100/84">
                {{ entry.description }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-[0.24em] text-stone-300 sm:grid-cols-4">
        <NuxtLink
          v-for="entry in quickLinks"
          :key="entry.to"
          :to="entry.to"
          data-umami-event="LinkHubClick"
          data-umami-section="quick_links"
          :data-umami-label="entry.label"
          data-umami-surface="link_page"
          class="inline-flex min-h-11 items-center justify-center border border-white/10 bg-black/25 px-3 py-2 text-center transition hover:border-amber-300/30 hover:text-amber-100"
        >
          {{ entry.label }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { getLinksEntries, getProjectEntries, getRunEntries } from '../composables/useContentCollections'
import { getProjectPreviewImage, getProjectStatusLabel } from '../utils/projects'
import { getSeriesCoverImage } from '../utils/runs'

definePageMeta({ layout: 'links' })

useSeoMeta({
  title: 'Liens utiles - Macojaune.com',
  description: "Retrouve toute l'actualité de Macojaune",
  robots: 'noindex,follow',
})

type LinkEntry = {
  text?: string
  url?: string
  description?: string
}

const { data: res } = await useAsyncData('get-links', () => getLinksEntries())
const [projectEntries, runEntries] = await Promise.all([
  getProjectEntries(),
  getRunEntries(),
])

const data = computed<LinkEntry[]>(() => {
  const entry = res.value?.[0]

  if (Array.isArray(entry?.link)) {
    return entry.link as LinkEntry[]
  }

  if (Array.isArray(entry?.meta?.link)) {
    return entry.meta.link as LinkEntry[]
  }

  return []
})

const aboutExcerpt = 'Je suis un grand curieux, un touche-à-tout. Ma passion pour la beauté m’a naturellement conduit vers la photographie, un médium qui me permet de retranscrire et de partager ma vision du monde, simplement, un instant à la fois.'

if (import.meta.client) {
  watchEffect(() => {
    if (data.value.length === 1 && data.value[0]?.url) {
      window.location.href = data.value[0].url
    }
  })
}

const cardBackgrounds = [
  'linear-gradient(135deg, rgba(180,83,9,0.95), rgba(120,53,15,0.88) 58%, rgba(28,25,23,0.98))',
  'linear-gradient(135deg, rgba(21,128,61,0.96), rgba(6,95,70,0.88) 56%, rgba(12,10,9,0.98))',
  'linear-gradient(135deg, rgba(30,64,175,0.95), rgba(67,56,202,0.84) 56%, rgba(17,24,39,0.98))',
  'linear-gradient(135deg, rgba(190,24,93,0.95), rgba(136,19,55,0.88) 56%, rgba(23,23,23,0.98))',
  'linear-gradient(135deg, rgba(8,145,178,0.94), rgba(14,116,144,0.86) 56%, rgba(12,10,9,0.98))',
]

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/macojaune' },
  { label: 'YouTube', href: 'https://www.youtube.com/@macojaune' },
  { label: 'Twitter', href: 'https://twitter.com/macojaune' },
]

const quickLinks = [
  { label: 'Blog', to: '/blog' },
  { label: 'Projets', to: '/projets' },
  { label: 'Galerie', to: '/galerie' },
  { label: 'À propos', to: '/a-propos' },
]

const shuffleArray = <T,>(items: T[]) => {
  const array = [...items]

  for (let index = array.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1))
    ;[array[index], array[nextIndex]] = [array[nextIndex], array[index]]
  }

  return array
}

const galleryOrder = useState<string[]>('link-gallery-order', () =>
  shuffleArray(runEntries.map((entry) => String(entry.slug || '')).filter(Boolean)),
)

const runEntriesBySlug = new Map(
  runEntries.map((entry) => [String(entry.slug || ''), entry]),
)

const projectHighlights = computed(() =>
  projectEntries.slice(0, 2).map((entry, index) => ({
    to: `/projets/${entry.permalink}`,
    slug: String(entry.permalink || ''),
    title: String(entry.title || 'Projet'),
    position: index + 1,
    meta: getProjectStatusLabel(entry.projectStatus),
    description: typeof entry.description === 'string' ? entry.description : '',
    image: getProjectPreviewImage(entry),
    tags: Array.isArray(entry.tags)
      ? entry.tags.filter((tag): tag is string => typeof tag === 'string' && Boolean(tag.trim())).slice(0, 2)
      : [],
  })),
)

const galleryHighlights = computed(() =>
  galleryOrder.value
    .map((slug) => runEntriesBySlug.get(slug))
    .filter(Boolean)
    .slice(0, 4)
    .map((entry) => ({
      to: `/series/${entry.slug}`,
      slug: String(entry.slug || ''),
      title: String(entry.title || 'Série'),
      position: galleryOrder.value.findIndex((slug) => slug === String(entry.slug || '')) + 1,
      meta: typeof entry.date === 'string' ? String(entry.date).slice(0, 4) : '',
      image: getSeriesCoverImage(entry),
    })),
)

const decoratedLinks = computed(() =>
  data.value.map((link, index) => ({
    ...link,
    background: cardBackgrounds[index % cardBackgrounds.length],
  })),
)
</script>
