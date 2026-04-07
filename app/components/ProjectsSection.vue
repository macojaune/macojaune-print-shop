<template>
  <section class="space-y-7 lg:space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-2xl">
        <h2 class="leading-[0.95] font-display text-4xl text-amber-400 lg:text-5xl">
          Projets photo
        </h2>
        <p class="mt-2 max-w-[34ch] text-sm leading-6 text-stone-300">
          Des idées déjà entamées ou encore à lancer. Sens-toi libre d'y participer.
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
            v-if="hasProjectCardImage(project)"
            :src="getProjectCardImage(project)"
            :alt="project.title"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />

          <template v-if="hasProjectCardImage(project)">
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.16)_0%,rgba(8,8,8,0.34)_26%,rgba(8,8,8,0.84)_100%)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:bg-[linear-gradient(180deg,rgba(8,8,8,0.06)_0%,rgba(8,8,8,0.18)_20%,rgba(8,8,8,0.58)_100%)]" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.08),transparent_22%)] opacity-80 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-55" />
            <div class="absolute inset-[1px] border border-amber-200/12 transition duration-300 group-hover:border-amber-100/28" />
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-300/40 via-amber-200/12 to-transparent" />

            <div class="relative z-10 flex h-full flex-col justify-between p-5 lg:p-6">
              <div class="flex flex-wrap items-start gap-2 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:translate-y-[-0.2rem] lg:group-hover:opacity-55">
                <span
                  v-if="getProjectStatusLabel(project.projectStatus)"
                  class="inline-flex items-center rounded-full border border-amber-200/38 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-100 shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                >
                  {{ getProjectStatusLabel(project.projectStatus) }}
                </span>
                <span
                  v-for="tag in getProjectDisplayTags(project)"
                  :key="`${project.permalink}-${tag}`"
                  class="inline-flex items-center rounded-full border border-white/12 bg-black/28 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-200/88 backdrop-blur-[2px]"
                >
                  {{ tag }}
                </span>
              </div>

              <div>
                <h3 class="max-w-[9ch] font-display text-[2.55rem] leading-[0.9] text-amber-50 transition duration-300 group-hover:text-amber-100 lg:text-[3.2rem]">
                  {{ project.title }}
                </h3>

                <div
                  v-if="getProjectSummary(project)"
                  class="mt-5 max-w-[30ch] overflow-hidden transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:max-h-28 lg:opacity-100 lg:group-hover:max-h-0 lg:group-hover:opacity-0"
                >
                  <p class="text-[0.95rem] leading-7 text-stone-200/92">
                    {{ getProjectSummary(project) }}
                  </p>
                </div>

                <div class="mt-5 flex items-center justify-between gap-4">
                  <span class="text-[10px] uppercase tracking-[0.28em] text-stone-300/74">
                    Voir le projet
                  </span>
                  <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200">
                    <span>Découvrir</span>
                    <span aria-hidden="true" class="transition duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="absolute inset-0 bg-[linear-gradient(145deg,rgba(10,10,10,0.98),rgba(20,14,5,0.96))]" />
            <div class="absolute inset-0 bg-[linear-gradient(180deg,rgba(251,191,36,0.08)_0,transparent_26%,transparent_74%,rgba(251,191,36,0.05)_100%)]" />
            <div class="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-amber-200/20 to-transparent" />
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-300/35 via-amber-200/10 to-transparent" />
            <div class="absolute -right-3 bottom-1 text-[4.8rem] font-display uppercase leading-none text-transparent opacity-70 transition duration-500 group-hover:translate-x-[-0.2rem] group-hover:opacity-100 [-webkit-text-stroke:1px_rgba(251,191,36,0.16)]">
              {{ getProjectGhostWord(project.title) }}
            </div>

            <div class="relative z-10 flex h-full flex-col justify-between p-5 lg:p-6">
              <div class="flex flex-wrap items-start gap-2">
                <span
                  v-if="getProjectStatusLabel(project.projectStatus)"
                  class="inline-flex items-center rounded-full border border-amber-200/35 bg-amber-300/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-100"
                >
                  {{ getProjectStatusLabel(project.projectStatus) }}
                </span>
                <span
                  v-for="tag in getProjectDisplayTags(project)"
                  :key="`${project.permalink}-${tag}`"
                  class="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-300/88"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="mt-6">
                <h3 class="max-w-[9ch] font-display text-[2.55rem] leading-[0.9] text-amber-100 transition duration-300 group-hover:text-amber-200 lg:text-[3.2rem]">
                  {{ project.title }}
                </h3>
                <p
                  v-if="getProjectSummary(project)"
                  class="mt-5 max-w-[30ch] text-[0.95rem] leading-7 text-stone-300"
                >
                  {{ getProjectSummary(project) }}
                </p>
              </div>

              <div class="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                <span class="text-[10px] uppercase tracking-[0.28em] text-stone-400">
                  Projet à construire
                </span>
                <span class="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200">
                  <span>Découvrir</span>
                  <span aria-hidden="true" class="transition duration-300 group-hover:translate-x-1">→</span>
                </span>
              </div>
            </div>
          </template>
        </NuxtLink>
      </div>
    </ContentList>
  </section>
</template>
<script setup lang="ts">
import { getProjectImages, getProjectStatusLabel } from '../utils/projects'

const previewSeed = useState('projects-preview-seed', () => Math.random())
const projectQuery = {
  path: '/projects',
  limit: 4,
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

const hasProjectCardImage = (project: Record<string, unknown>) => Boolean(getProjectCardImage(project))

const getProjectDisplayTags = (project: Record<string, unknown>) => {
  const source = Array.isArray(project.tags) && project.tags.length
    ? project.tags
    : Array.isArray(project.categories)
      ? project.categories
      : []

  return source
    .map((entry) => String(entry || '').trim())
    .filter(Boolean)
    .slice(0, 3)
}

const getProjectSummary = (project: Record<string, unknown>) => {
  const description = typeof project.description === 'string' ? project.description.trim() : ''
  if (!description) {
    return ''
  }

  if (description.length <= 140) {
    return description
  }

  return `${description.slice(0, 137).trimEnd()}...`
}

const getProjectGhostWord = (title: unknown) => {
  const firstWord = String(title || '').trim().split(/\s+/)[0] || 'PROJET'
  return firstWord.slice(0, 8).toUpperCase()
}

const projectCardClass = (_index: number) => 'min-h-[19rem] lg:col-span-6 lg:row-span-1'
</script>
