<template>
  <div class="homepage-shell relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
    <div class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_18%_18%,rgba(255,215,0,0.18),transparent_32%),radial-gradient(circle_at_82%_24%,rgba(255,255,255,0.14),transparent_26%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.88))]" />
    <div class="pointer-events-none absolute inset-x-0 top-12 -z-10 mx-auto h-[38rem] max-w-6xl rounded-[40px] border border-white/10 bg-white/5 blur-3xl" />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-10 pb-16">
      <section class="grid gap-8 lg:grid-cols-12 lg:gap-8 xl:min-h-[47rem]">
        <motion.div
          class="glass-panel relative overflow-hidden p-7 sm:p-9 lg:col-span-7 xl:p-12"
          :initial="{ opacity: 0, y: 48 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="reducedMotion ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }"
        >
          <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,215,0,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.12),transparent_30%)]" />
          <div class="relative flex h-full flex-col justify-between gap-10">
            <div class="space-y-8">
              <div class="flex flex-wrap gap-3">
                <span
                  v-for="pill in heroPills"
                  :key="pill"
                  class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300"
                >
                  {{ pill }}
                </span>
              </div>

              <div class="max-w-3xl space-y-5">
                <p class="text-sm uppercase tracking-[0.35em] text-amber-300/90">
                  Cabinet de curiosites digital
                </p>
                <h1 class="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.045em] text-slate-50 sm:text-6xl lg:text-7xl">
                  Lieu de passage pour un regard qui photographie, code et documente.
                </h1>
                <p class="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                  Macojaune ne tient pas dans une seule case. Cette homepage met en scene un
                  esprit multipotentiel ou les images, les idees et les experiments techniques
                  dialoguent sans bruit visuel.
                </p>
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <motion.div
                v-for="(stat, index) in heroStats"
                :key="stat.label"
                class="rounded-[22px] border border-white/10 bg-slate-950/35 p-5"
                :initial="{ opacity: 0, y: 24 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="reducedMotion ? { duration: 0 } : { delay: 0.15 + index * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }"
              >
                <p class="mb-2 text-xs uppercase tracking-[0.28em] text-slate-400">
                  {{ stat.label }}
                </p>
                <p class="mb-3 text-3xl font-semibold tracking-[-0.04em] text-slate-50">
                  {{ stat.value }}
                </p>
                <p class="mb-0 text-sm leading-6 text-slate-300">
                  {{ stat.detail }}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          class="relative grid gap-5 lg:col-span-5"
          :initial="{ opacity: 0, y: 56 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="reducedMotion ? { duration: 0 } : { duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }"
        >
          <div class="glass-panel relative min-h-[24rem] overflow-hidden p-4 sm:p-5">
            <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,215,0,0.26),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
            <nuxt-img
              :src="heroImage"
              :alt="heroImageAlt"
              format="webp"
              sizes="xs:100vw lg:40vw"
              placeholder
              class="hero-visual h-full min-h-[22rem] w-full rounded-[24px] object-cover"
            />

            <motion.div
              class="glass-chip absolute left-4 top-4 sm:left-5 sm:top-5"
              :animate="reducedMotion ? { y: 0 } : { y: [0, -10, 0] }"
              :transition="reducedMotion ? { duration: 0 } : { duration: 7, repeat: Infinity, ease: 'easeInOut' }"
            >
              <span class="text-xs uppercase tracking-[0.3em] text-slate-100">Vision</span>
              <strong class="block text-lg font-semibold text-slate-50">Portraits, objets, systemes</strong>
            </motion.div>

            <motion.div
              class="glass-chip absolute bottom-4 right-4 max-w-[15rem] sm:bottom-5 sm:right-5"
              :animate="reducedMotion ? { y: 0 } : { y: [0, 12, 0] }"
              :transition="reducedMotion ? { duration: 0 } : { duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }"
            >
              <span class="mb-2 block text-xs uppercase tracking-[0.3em] text-amber-200">Fil conducteur</span>
              <p class="mb-0 text-sm leading-6 text-slate-100">
                La curiosite devient methode: observer, relier, publier.
              </p>
            </motion.div>
          </div>

          <div class="grid gap-5 sm:grid-cols-[1.15fr_0.85fr]">
            <div class="glass-panel flex flex-col justify-between gap-6 p-6">
              <div>
                <p class="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  Intentions
                </p>
                <h2 class="mb-3 text-2xl font-semibold leading-tight tracking-[-0.03em] text-slate-50">
                  Une interface qui laisse la personne respirer avant les categories.
                </h2>
              </div>
              <p class="mb-0 text-sm leading-7 text-slate-300">
                Pas un portfolio lisse. Pas une boutique standard. Plutot une vitrine immersive
                ou chaque facette nourrit la suivante.
              </p>
            </div>

            <div class="glass-panel flex flex-col justify-between gap-6 p-6">
              <div>
                <p class="mb-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                  Acces directs
                </p>
                <ul class="space-y-3">
                  <li v-for="entry in quickLinks" :key="entry.to">
                    <NuxtLink
                      :to="entry.to"
                      class="group flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition duration-300 hover:border-amber-300/60 hover:bg-amber-300/10 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {{ entry.label }}
                      <span class="transition duration-300 group-hover:translate-x-1">↗</span>
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <motion.div
          class="glass-panel p-7 sm:p-8 lg:col-span-4"
          :initial="{ opacity: 0, y: 32 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.35 }"
          :transition="reducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }"
        >
          <p class="text-sm uppercase tracking-[0.32em] text-amber-300/90">
            Esprit multipotentiel
          </p>
          <h2 class="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.04em] text-slate-50">
            Trois terrains. Une seule logique.
          </h2>
          <p class="mt-5 max-w-md text-base leading-8 text-slate-300">
            La photo observe. Le developpement structure. Le contenu relie. Ensemble, ces pratiques
            forment un meme geste: transformer la curiosite en experiences partageables.
          </p>
        </motion.div>

        <div class="grid gap-5 lg:col-span-8 md:grid-cols-3">
          <motion.article
            v-for="(cluster, index) in mindClusters"
            :key="cluster.title"
            class="glass-panel group relative overflow-hidden p-6 sm:p-7"
            :initial="{ opacity: 0, y: 24 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.25 }"
            :transition="reducedMotion ? { duration: 0 } : { delay: index * 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }"
          >
            <div
              class="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            />
            <div class="mb-6 flex items-center justify-between">
              <span class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                {{ cluster.kicker }}
              </span>
              <span class="text-xl text-amber-300/90">{{ cluster.icon }}</span>
            </div>
            <h3 class="text-2xl font-semibold tracking-[-0.03em] text-slate-50">
              {{ cluster.title }}
            </h3>
            <p class="mt-4 text-sm leading-7 text-slate-300">
              {{ cluster.description }}
            </p>
            <ul class="mt-6 space-y-3">
              <li
                v-for="item in cluster.points"
                :key="item"
                class="flex items-start gap-3 text-sm leading-6 text-slate-200"
              >
                <span class="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </motion.article>
        </div>
      </section>

      <section class="space-y-6">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.32em] text-amber-300/90">
              Projets choisis
            </p>
            <h2 class="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-5xl">
              Trois pieces pour comprendre l’ecosysteme.
            </h2>
          </div>
          <p class="max-w-2xl text-sm leading-7 text-slate-300">
            Une entree par l’image, une par la pensee technique, une par la documentation.
            L’ensemble raconte une pratique complete plutot qu’une specialite unique.
          </p>
        </div>

        <div class="grid gap-5 lg:grid-cols-12">
          <motion.article
            v-for="(card, index) in featuredCards"
            :key="card.title"
            :class="[
              'glass-panel group relative overflow-hidden',
              index === 0 ? 'lg:col-span-6 lg:row-span-2' : 'lg:col-span-3'
            ]"
            :initial="{ opacity: 0, y: 28 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true, amount: 0.2 }"
            :transition="reducedMotion ? { duration: 0 } : { delay: index * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }"
          >
            <div class="relative h-full">
              <nuxt-img
                :src="card.image"
                :alt="card.alt"
                format="webp"
                sizes="xs:100vw lg:50vw"
                placeholder
                class="h-full min-h-[18rem] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                :class="index === 0 ? 'lg:min-h-[34rem]' : 'lg:min-h-[16rem]'"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,215,0,0.22),transparent_28%)] opacity-90" />
              <div class="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end p-6 sm:p-7">
                <div class="max-w-xl">
                  <span class="inline-flex rounded-full border border-white/10 bg-slate-950/45 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-100 backdrop-blur-xl">
                    {{ card.label }}
                  </span>
                  <h3 class="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-50">
                    {{ card.title }}
                  </h3>
                  <p class="mt-4 text-sm leading-7 text-slate-200/95">
                    {{ card.summary }}
                  </p>
                  <NuxtLink
                    :to="card.to"
                    class="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    Explorer
                    <span>↗</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-12">
        <motion.div
          class="glass-panel p-7 sm:p-8 lg:col-span-8"
          :initial="{ opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.25 }"
          :transition="reducedMotion ? { duration: 0 } : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }"
        >
          <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.32em] text-amber-300/90">
                Dernieres reflexions
              </p>
              <h2 class="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-50">
                Notes, prises de position et retours d’experience.
              </h2>
            </div>
            <NuxtLink
              to="/blog"
              class="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 transition hover:text-amber-200"
            >
              Voir tous les articles
              <span>↗</span>
            </NuxtLink>
          </div>

          <div class="space-y-4">
            <NuxtLink
              v-for="(insight, index) in latestInsights"
              :key="insight.to"
              :to="insight.to"
              class="group grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-5 transition duration-300 hover:border-amber-300/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            >
              <span class="text-xs uppercase tracking-[0.3em] text-slate-400">
                {{ padNumber(index + 1) }}
              </span>
              <div class="space-y-2">
                <h3 class="text-xl font-semibold tracking-[-0.03em] text-slate-50">
                  {{ insight.title }}
                </h3>
                <p class="mb-0 text-sm leading-7 text-slate-300">
                  {{ insight.summary }}
                </p>
              </div>
              <div class="text-sm text-slate-400">
                {{ insight.dateLabel }}
              </div>
            </NuxtLink>
          </div>
        </motion.div>

        <motion.aside
          class="glass-panel flex flex-col gap-6 p-7 sm:p-8 lg:col-span-4"
          :initial="{ opacity: 0, y: 24 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true, amount: 0.25 }"
          :transition="reducedMotion ? { duration: 0 } : { duration: 0.72, delay: 0.08, ease: [0.16, 1, 0.3, 1] }"
        >
          <p class="text-sm uppercase tracking-[0.32em] text-amber-300/90">
            Contact direct
          </p>
          <h2 class="text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-slate-50">
            On parle exposition, produit, contenu ou collaboration.
          </h2>
          <p class="mb-0 text-base leading-8 text-slate-300">
            Si une idee merite d’etre rendue visible ou construite avec exigence, la conversation
            peut commencer ici.
          </p>

          <div class="space-y-3">
            <a
              href="mailto:hello@macojaune.com"
              class="inline-flex w-full items-center justify-between rounded-full border border-amber-300/30 bg-amber-300/12 px-5 py-4 text-sm font-semibold text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              hello@macojaune.com
              <span>↗</span>
            </a>
            <NuxtLink
              to="/link"
              class="inline-flex w-full items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Reseaux, prises de contact et points d’entree
              <span>↗</span>
            </NuxtLink>
          </div>

          <div class="rounded-[26px] border border-white/10 bg-slate-950/35 p-5">
            <p class="mb-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              Positionnement
            </p>
            <p class="mb-0 text-sm leading-7 text-slate-200">
              Curiosite structurelle, execution sensible, regard ancre en Guadeloupe sans folklore
              d’interface.
            </p>
          </div>
        </motion.aside>
      </section>
    </main>
  </div>
</template>

<script lang="ts" setup>
import { motion } from 'motion-v'
import moment from 'moment'
import { getBlogEntries, getProjectEntries } from '~/composables/useContentCollections'
import { toAssetUrl } from '~/lib/asset-url'

moment.locale('fr')

interface GlassThemeTokens {
  effects: {
    blurBase: string
    blurHeavy: string
    glowYellow: string
  }
  shadows: {
    glassDrop: string
  }
}

interface ContentEntry {
  title?: string
  permalink?: string
  image?: string
  date?: string
  categories?: string[]
}

interface FeaturedCard {
  label: string
  title: string
  summary: string
  to: string
  image: string
  alt: string
}

interface InsightItem {
  to: string
  title: string
  summary: string
  dateLabel: string
}

const glassThemeTokens: GlassThemeTokens = {
  effects: {
    blurBase: 'blur(12px)',
    blurHeavy: 'blur(24px)',
    glowYellow: '0 0 40px -10px rgba(255, 215, 0, 0.3)'
  },
  shadows: {
    glassDrop: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
  }
}

const heroPills = ['Photographie', 'Developpement', 'Contenu', 'Guadeloupe', 'Entrepreneuriat']

const reducedMotion = ref(false)

const heroStats = [
  {
    label: 'Regard',
    value: 'Photo',
    detail: 'Des series qui vont du corps aux details silencieux.'
  },
  {
    label: 'Systeme',
    value: 'Code',
    detail: 'Des outils, des idees et une obsession pour les structures utiles.'
  },
  {
    label: 'Transmission',
    value: 'Recit',
    detail: 'Articles, videos et notes pour documenter plutot que surjouer.'
  }
] as const

const quickLinks = [
  { label: 'Voir les projets', to: '/projets' },
  { label: 'Lire le blog', to: '/blog' },
  { label: 'Explorer les liens', to: '/link' }
] as const

const mindClusters = [
  {
    kicker: 'Observation',
    icon: '◌',
    title: 'Photographie',
    description: 'Le travail photo sert de laboratoire visuel. Il capte les textures, les corps, les failles et les nuances que le regard standard ignore.',
    points: ['Series a forte intimite visuelle', 'Direction sensible plutot que demonstrative', 'Image comme point de depart du recit']
  },
  {
    kicker: 'Structure',
    icon: '△',
    title: 'Developpement',
    description: 'Le code n’est pas une competence annexe. C’est la maniere de construire des espaces clairs, performants et suffisamment souples pour accueillir plusieurs vies.',
    points: ['Pensée systemique', 'Autonomie sur les outils et les plateformes', 'Curiosite technique transformee en experiences']
  },
  {
    kicker: 'Transmission',
    icon: '✦',
    title: 'Creation de contenu',
    description: 'Le contenu fait le lien entre l’experience vecue et le public. Il documente, contextualise et donne un sens partageable a ce qui est produit.',
    points: ['Articles et prises de position', 'Video et formats courts en reconstruction', 'Documentation comme geste editorial']
  }
] as const

const description =
  'Macojaune.com presente un univers personnel ou la photographie, le developpement et la creation de contenu se repondent. Une homepage immersive, en francais, pour comprendre rapidement la personne, ses projets et ses prises de parole.'

const fallbackImage = toAssetUrl('/pictures/MCO09198 (Large).jpg')

const featuredProjectPriority = ['lang', 'skinz', 'poils-et-feminite'] as const
const featuredPostPriority = [
  'web3-gist',
  'moi-formateur-web-developpeur',
  'un-retour-peut-etre'
] as const

const editorialSummaries: Record<string, string> = {
  lang: 'Une recherche photographique frontale et intime sur la langue comme organe, parole et signe d’identite.',
  skinz: 'Une serie sur les peaux, les marques et la memoire visible des corps, pensee comme exposition ou livre.',
  'poils-et-feminite': 'Une piste visuelle autour du corps feminin, de ses details et de ce qu’ils racontent socialement et symboliquement.',
  'web3-gist': 'Une cartographie personnelle des sujets crypto et web3, entre veille, curiosite technique et partage de ressources.',
  'moi-formateur-web-developpeur': 'Un retour d’experience sur la transmission, la legitimite et le fait d’enseigner le developpement en Guadeloupe.',
  'un-retour-peut-etre': 'Une prise de position sur le besoin de documenter sa vie sans devenir un createur formate par les algorithmes.'
}

const editorialAlt: Record<string, string> = {
  lang: 'Photographie du projet LANG, centree sur un detail corporel et une mise en scene intime.',
  skinz: 'Image du projet Skinz mettant en valeur la texture et les marques de la peau.',
  'poils-et-feminite': 'Visuel du projet Poils et femininite, axe sur le detail et la proximite.',
  'web3-gist': 'Illustration de l’article sur la crypto et le web3.',
  'moi-formateur-web-developpeur': 'Visuel de l’article sur l’experience de formation en developpement web.',
  'un-retour-peut-etre': 'Image d’accompagnement pour l’article sur le retour a la documentation du quotidien.'
}

const { data } = await useAsyncData('home-content', async () => {
  const [projects, posts] = await Promise.all([
    getProjectEntries(),
    getBlogEntries()
  ])

  return {
    projects: projects as ContentEntry[],
    posts: posts as ContentEntry[]
  }
})

const projects = computed(() => data.value?.projects ?? [])
const posts = computed(() => data.value?.posts ?? [])

const pickByPriority = (
  entries: ContentEntry[],
  priority: readonly string[]
): ContentEntry | null => {
  return (
    priority
      .map((permalink) => entries.find((entry) => entry.permalink === permalink))
      .find((entry): entry is ContentEntry => Boolean(entry)) ??
    entries.find((entry) => entry.image) ??
    entries[0] ??
    null
  )
}

const photoProject = computed(() => pickByPriority(projects.value, featuredProjectPriority))
const techProject = computed(() => {
  return (
    pickByPriority(posts.value, featuredPostPriority) ??
    posts.value[0] ??
    null
  )
})

const mediaProject = computed(() => {
  const excludedPermalink = techProject.value?.permalink

  return (
    posts.value.find((entry) => entry.permalink && entry.permalink !== excludedPermalink) ??
    posts.value[1] ??
    null
  )
})

const heroImage = computed(() => {
  return photoProject.value?.image ?? mediaProject.value?.image ?? fallbackImage
})

const heroImageAlt = computed(() => {
  const permalink = photoProject.value?.permalink ?? mediaProject.value?.permalink
  return (permalink && editorialAlt[permalink]) || 'Visuel principal illustrant l’univers de Macojaune.'
})

const featuredCards = computed<FeaturedCard[]>(() => [
  {
    label: 'Projet photo',
    title: photoProject.value?.title ?? 'Serie en cours',
    summary:
      editorialSummaries[photoProject.value?.permalink ?? ''] ??
      'Une entree par l’image pour voir comment les details, les peaux et les symboles deviennent matiere narrative.',
    to: photoProject.value?.permalink ? `/projets/${photoProject.value.permalink}` : '/projets',
    image: photoProject.value?.image ?? fallbackImage,
    alt:
      editorialAlt[photoProject.value?.permalink ?? ''] ??
      'Projet photo mis en avant sur la homepage.'
  },
  {
    label: 'Piste tech',
    title: techProject.value?.title ?? 'Reflexions techniques',
    summary:
      editorialSummaries[techProject.value?.permalink ?? ''] ??
      'Des experiments numeriques, des apprentissages et des prises de recul sur la construction web et les outils.',
    to: techProject.value?.permalink ? `/blog/${techProject.value.permalink}` : '/blog',
    image: techProject.value?.image ?? heroImage.value,
    alt:
      editorialAlt[techProject.value?.permalink ?? ''] ??
      'Article a dominante technique mis en avant sur la homepage.'
  },
  {
    label: 'Media & contenu',
    title: mediaProject.value?.title ?? 'Documenter plutot que performer',
    summary:
      editorialSummaries[mediaProject.value?.permalink ?? ''] ??
      'Le contenu sert a rendre visibles les essais, les doutes et les trajectoires qui nourrissent les projets.',
    to: mediaProject.value?.permalink ? `/blog/${mediaProject.value.permalink}` : '/blog',
    image: mediaProject.value?.image ?? heroImage.value,
    alt:
      editorialAlt[mediaProject.value?.permalink ?? ''] ??
      'Projet de contenu mis en avant sur la homepage.'
  }
])

const latestInsights = computed<InsightItem[]>(() =>
  posts.value.slice(0, 3).map((entry) => ({
    to: entry.permalink ? `/blog/${entry.permalink}` : '/blog',
    title: entry.title ?? 'Article',
    summary:
      editorialSummaries[entry.permalink ?? ''] ??
      'Une note pour relier apprentissage, experience vecue et regard critique sur la creation.',
    dateLabel: entry.date ? moment(entry.date).format('DD MMM YYYY') : 'Archive',
  }))
)

const padNumber = (value: number): string => value.toString().padStart(2, '0')

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

useHead({
  title: 'Macojaune.com | Photographe, developpeur, createur de contenu',
  meta: [
    {
      name: 'title',
      content: 'Macojaune.com | Photographe, developpeur, createur de contenu'
    },
    {
      name: 'description',
      content: description
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/' },
    { property: 'og:title', content: 'Macojaune.com | Photographe, developpeur, createur de contenu' },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: heroImage.value },
    {
      property: 'twitter:card',
      content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/' },
    { property: 'twitter:title', content: 'Macojaune.com | Photographe, developpeur, createur de contenu' },
    {
      property: 'twitter:description',
      content: description
    },
    { property: 'twitter:image', content: heroImage.value }
  ],
  style: [
    {
      children: `
        :root {
          --glass-blur-base: ${glassThemeTokens.effects.blurBase};
          --glass-blur-heavy: ${glassThemeTokens.effects.blurHeavy};
          --glass-glow-yellow: ${glassThemeTokens.effects.glowYellow};
          --glass-drop-shadow: ${glassThemeTokens.shadows.glassDrop};
        }
      `
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Macojaune',
        url: 'https://macojaune.com',
        jobTitle: ['Photographe', 'Developpeur web', 'Createur de contenu'],
        knowsAbout: ['Photographie', 'Developpement web', 'Entrepreneuriat', 'Creation de contenu'],
        sameAs: [
          'https://instagram.com/macojaune',
          'https://facebook.com/macojaune',
          'https://twitter.com/macojaune'
        ]
      })
    }
  ]
})
</script>

<style scoped>
.homepage-shell {
  color: #f8fafc;
}

.glass-panel {
  border-radius: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    rgba(255, 255, 255, 0.05);
  backdrop-filter: var(--glass-blur-base);
  box-shadow: var(--glass-drop-shadow), var(--glass-glow-yellow);
}

.glass-chip {
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(15, 23, 42, 0.42);
  padding: 0.85rem 1rem;
  backdrop-filter: var(--glass-blur-heavy);
  box-shadow: var(--glass-drop-shadow);
}

.hero-visual {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
</style>
