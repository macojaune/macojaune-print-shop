<template>
  <section class="space-y-7 lg:space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl">
        <h2 class="leading-[0.95] font-display text-4xl text-amber-400 lg:text-5xl">
          Projets photo en cours
        </h2>
        <p class="mt-2 max-w-[34ch] text-sm leading-6 text-stone-300">
          Un aperçu de ce que j'ai envie de réaliser. Sens-toi libre d'y participer.
        </p>
      </div>
      <NuxtLink
        class="inline-flex min-h-11 w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-amber-200 transition hover:text-amber-400"
        to="/projets"
      >
        Voir tous les projets
      </NuxtLink>
    </div>

    <ContentList v-slot="{ list }" :query="projectQuery">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(13rem,_1fr)]">
        <NuxtLink
          v-for="(project, index) in list"
          :key="project.id"
          :to="`/projets/${project.permalink}?project=${project.permalink}`"
          :class="projectCardClass(index)"
          class="group relative overflow-hidden bg-stone-950"
        >
          <ProjectImage
            v-if="getProjectCardImage(project)"
            :src="getProjectCardImage(project)"
            :alt="project.title"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />

          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5 transition duration-300 group-hover:from-black/92 group-hover:via-black/50" />
          <div class="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-200/10 to-transparent opacity-60 transition duration-300 group-hover:opacity-100" />

          <div class="relative z-10 flex h-full flex-col justify-end p-5 lg:p-6">
            <p v-if="project.date" class="mb-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
              {{ formatCardDate(project.date) }}
            </p>
            <h3 class="max-w-[12ch] font-display text-3xl leading-[0.95] text-white transition duration-300 group-hover:text-amber-200 lg:text-4xl">
              {{ project.title }}
            </h3>
          </div>
        </NuxtLink>
      </div>
    </ContentList>
  </section>
</template>
<script setup lang="ts">
import type { QueryBuilderParams } from '@nuxt/content/types'
import { getProjectImages } from '../utils/projects'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })
const previewSeed = useState('projects-preview-seed', () => Math.random())

const projectQuery: QueryBuilderParams = {
  path: '/projects',
  where: { draft: { $eq: false } },
  limit: 4,
  sort: { date: -1 },
}

const seededRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000
  return value - Math.floor(value)
}

const getProjectCardImage = (project: Record<string, unknown>) => {
  const images = getProjectImages(project)
  if (!images.length) {
    return ''
  }

  const seed = Array.from(`${project.permalink || project.title || ''}-${previewSeed.value}`).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  )

  return images[Math.floor(seededRandom(seed || 1) * images.length)] || images[0]
}

const projectCardClass = (index: number) => {
  if (index === 0) {
    return 'min-h-[22rem] lg:col-span-7 lg:row-span-2'
  }

  if (index === 1) {
    return 'min-h-[16rem] lg:col-span-5 lg:row-span-1'
  }

  return 'min-h-[16rem] lg:col-span-5 lg:row-span-1'
}

const formatCardDate = (value?: string | null) => {
  if (!value) {
    return ''
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? '' : dateFormatter.format(parsedDate)
}
</script>
