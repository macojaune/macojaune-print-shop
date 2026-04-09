<template>
  <div class="w-full px-4 py-6 lg:px-6 lg:py-8">
    <div class="mx-auto max-w-[1500px]">
      <header class="grid gap-8 border-b border-amber-200/10 pb-10 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-14">
        <div class="lg:col-span-8">
          <NuxtLink
            to="/"
            data-umami-event="ProjectsClick"
            data-umami-section="header"
            data-umami-label="Retour à l'accueil"
            data-umami-surface="projects_index"
            class="inline-flex w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
          >
            Retour à l&apos;accueil
          </NuxtLink>
          <h1 class="mt-5 max-w-[11ch] font-display text-5xl leading-[0.84] text-amber-400 lg:text-[6rem]">
            Projets photographiques
          </h1>
        </div>

        <div class="lg:col-span-4 lg:pb-2">
          <p class="max-w-[30ch] text-base leading-7 text-stone-300">
            Des idées encore en mouvement, avec le brief, les inspirations et de quoi y participer si le projet t&apos;appelle.
          </p>
        </div>
      </header>

      <ContentList v-slot="{ list }" :query="query">
        <div class="pt-10 lg:pt-14">
          <div class="flex flex-col">
            <nuxt-link
              v-for="(project, index) in list"
              :key="project.permalink"
              :to="`/projets/${project.permalink}?project=${project.permalink}`"
              data-umami-event="ProjectsClick"
              data-umami-section="projects_grid"
              :data-umami-label="project.title"
              :data-umami-position="index + 1"
              data-umami-content-type="project"
              :data-umami-content-slug="project.permalink"
              data-umami-surface="projects_index"
              class="group border-b border-amber-200/10 py-6 transition lg:py-8"
            >
              <div class="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-8">
                <div v-if="getProjectCardImage(project)" class="overflow-hidden bg-stone-950 lg:col-span-3">
                  <ProjectImage
                    :src="getProjectCardImage(project)"
                    :alt="project.title"
                    loading="lazy"
                    class="aspect-[4/5] h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <div :class="getProjectCardImage(project) ? 'lg:col-span-5' : 'lg:col-span-7'">
                  <div class="flex flex-col gap-3">
                    <p
                      v-if="getProjectStatusLabel(project.projectStatus)"
                      class="inline-flex w-fit items-center rounded-full border border-amber-200/22 bg-amber-300/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-100/92"
                    >
                      {{ getProjectStatusLabel(project.projectStatus) }}
                    </p>
                    <h2 class="max-w-[11ch] font-display text-4xl leading-[0.9] text-white transition group-hover:text-amber-200 lg:text-[3.5rem]">
                      {{ project.title }}
                    </h2>
                  </div>
                </div>

                <div :class="getProjectCardImage(project) ? 'lg:col-span-4' : 'lg:col-span-4 lg:col-start-9'" class="lg:self-end">
                  <p class="text-base leading-7 text-stone-300 line-clamp-4 lg:text-[1.02rem]">
                    {{ project?.description }}
                  </p>
                  <div class="mt-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-amber-300/72">
                    <span>Découvrir</span>
                    <span class="h-px w-10 bg-amber-300/55 transition duration-300 group-hover:w-16" />
                  </div>
                </div>
              </div>
            </nuxt-link>
          </div>
        </div>
      </ContentList>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { QueryBuilderParams } from '@nuxt/content/types'
import { listContentEntries } from '../../composables/useContentCollections'
import { buildSiteOgImagePath } from '../../utils/og-images'
import { getProjectImages, getProjectPreviewImage, getProjectStatusLabel } from '../../utils/projects'

const query: QueryBuilderParams = { path: '/projects' }
const projectCardImages = useState<Record<string, string>>('project-card-images', () => ({}))
const { data: projectsForMeta } = await useAsyncData('projects-meta-list', () =>
  listContentEntries({ path: '/projects' }),
)

const title = 'Les Projets photo du Macojaune'
const description =
  "Moodboards, idées de projets photo, inspirations, et tout ce qu'il faut pour y participer. Créons ensemble des œuvres qui nous ressemblent."
const socialImage = `https://macojaune.com${buildSiteOgImagePath({
  title: 'Projets photo',
  eyebrow: 'Macojaune',
  description,
  image: getProjectPreviewImage(projectsForMeta.value?.[0]) || '/pictures/dsc06261.jpg',
})}`

const getProjectCardImage = (project: { permalink?: string | null, image?: string | null, images?: unknown }) => {
  const projectKey = typeof project?.permalink === 'string' ? project.permalink : ''
  const cachedImage = projectKey ? projectCardImages.value[projectKey] : ''
  if (cachedImage) {
    return cachedImage
  }

  const images = getProjectImages(project)
  const nextImage = images.length > 1
    ? images[Math.floor(Math.random() * images.length)]
    : images[0] || ''

  if (projectKey && nextImage) {
    projectCardImages.value[projectKey] = nextImage
  }

  return nextImage
}

useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title,
    },
    {
      name: 'description',
      content: description,
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/projets' },
    { property: 'og:title', content: title },
    {
      property: 'og:description',
      content: description,
    },
    { property: 'og:image', content: socialImage },
    {
      property: 'twitter:card', content: 'summary_large_image',
    },
    { property: 'twitter:url', content: 'https://macojaune.com/projets' },
    { property: 'twitter:title', content: title },
    {
      property: 'twitter:description',
      content: description,
    },
    { property: 'twitter:image', content: socialImage },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://macojaune.com/projets',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': 'https://macojaune.com',
              name: 'Homepage',
            },
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/projets',
              name: 'Projets photographiques',
            },
          },
        ],
      }),
    },
  ],
})
</script>
