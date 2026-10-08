<template>
  <LinksHub :links="data" :gallery="galleryHighlights" :projects="projectHighlights" :about="aboutExcerpt" />
</template>

<script setup lang="ts">
import { getLinksEntries, getProjectEntries, getRunEntries } from '../composables/useContentCollections'
import { getProjectPreviewImage, getProjectStatusLabel } from '../utils/projects'
import { getSeriesCoverImage } from '../utils/runs'
import LinksHub from '../components/links/LinksHub.vue'

definePageMeta({ layout: false })
useHead({ script: [{ src: 'https://analytics.marvinl.com/script.js', 'data-website-id': '0b0e019d-fed5-4e0d-aa0b-01c8811b7a53', defer: true }] })

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

const runEntriesBySlug = new Map(runEntries.map(entry => [String(entry.slug || ''), entry]))

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
  ['octavia-industriel', 'wreck', 'joranie-maison-de-la-mangrove', 'carnaval-2024']
    .map((slug) => runEntriesBySlug.get(slug))
    .filter(Boolean)
    .slice(0, 4)
    .map((entry, index) => ({
      to: `/series/${entry.slug}`,
      slug: String(entry.slug || ''),
      title: String(entry.title || 'Série'),
      position: index + 1,
      meta: typeof entry.date === 'string' ? String(entry.date).slice(0, 4) : '',
      image: getSeriesCoverImage(entry),
    })),
)

</script>
