<template>
  <div class="series-page pb-12 pt-6 sm:pb-16 lg:pb-24">
    <div class="space-y-10 sm:space-y-12 lg:space-y-16">
      <section class="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/75 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)]" />
          <div class="absolute inset-0 bg-gradient-to-br from-slate-950/45 via-slate-950/70 to-black/90" />

          <RunImage
            v-if="heroImage"
            class="absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen"
            :src="heroImage"
            :alt="serie.title"
            variant="detail"
            sizes="100vw"
            loading="eager"
          />

          <div class="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.25fr)_20rem] lg:gap-10 lg:p-12">
            <div class="space-y-8">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition duration-200 hover:border-amber-300/50 hover:text-amber-100"
              >
                Retour a la boutique
                <span aria-hidden="true">↗</span>
              </NuxtLink>

              <div class="max-w-4xl space-y-5">
                <p class="mb-0 text-xs uppercase tracking-[0.34em] text-amber-300/90 sm:text-sm">
                  Serie photo
                </p>
                <h1 class="mb-0 font-display text-4xl font-bold uppercase leading-[0.9] tracking-[-0.05em] text-slate-50 sm:text-5xl lg:text-7xl">
                  {{ serie.title }}
                </h1>
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span class="rounded-full border border-white/10 bg-white/5 px-4 py-2 uppercase tracking-[0.22em]">
                    {{ formatDate(serie.date) }}
                  </span>
                  <span class="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 uppercase tracking-[0.22em] text-amber-100">
                    {{ productCountLabel }}
                  </span>
                </div>
                <p class="mb-0 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                  {{ serie.description }}
                </p>
              </div>

              <div class="grid gap-4 sm:grid-cols-3">
                <article
                  v-for="note in heroNotes"
                  :key="note.label"
                  class="rounded-[24px] border border-white/10 bg-slate-950/45 p-5 backdrop-blur-sm"
                >
                  <p class="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    {{ note.label }}
                  </p>
                  <p class="mb-0 text-sm leading-7 text-slate-200">
                    {{ note.value }}
                  </p>
                </article>
              </div>
            </div>

            <aside class="flex flex-col justify-between gap-5 rounded-[26px] border border-white/10 bg-black/35 p-5 backdrop-blur-sm">
              <div class="space-y-4">
                <p class="mb-0 text-xs uppercase tracking-[0.3em] text-amber-300/90">
                  Pour collectionner
                </p>
                <h2 class="mb-0 text-2xl font-semibold leading-tight tracking-[-0.04em] text-slate-50">
                  Choisis la piece qui tient le mieux dans ton espace et dans ton humeur.
                </h2>
              </div>

              <div class="space-y-3">
                <div
                  v-for="detail in collectorDetails"
                  :key="detail.label"
                  class="rounded-[20px] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <p class="mb-1 text-[0.68rem] uppercase tracking-[0.26em] text-slate-400">
                    {{ detail.label }}
                  </p>
                  <p class="mb-0 text-sm leading-7 text-slate-100">
                    {{ detail.value }}
                  </p>
                </div>
              </div>
            </aside>
          </div>
      </section>

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          <article class="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:p-8">
            <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                  Narration
                </p>
                <h2 class="mb-0 text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-4xl">
                  Le contexte avant l’achat.
                </h2>
              </div>
              <p class="mb-0 max-w-md text-sm leading-7 text-slate-400">
                Chaque serie garde sa respiration editoriale, meme quand elle mene vers une piece a commander.
              </p>
            </div>

            <div class="series-copy max-w-none text-base leading-8 text-slate-200">
              <ContentRendererMarkdown :value="serie" />
            </div>
          </article>

          <aside class="grid gap-4">
            <div
              v-for="image in seriesHighlights"
              :key="image.src"
              class="group overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/55"
            >
              <RunImage
                class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                :src="image.src"
                :alt="image.alt"
                variant="detail"
                sizes="(max-width: 1023px) 100vw, 22rem"
              />
            </div>
          </aside>
      </section>

      <section class="space-y-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                Tirages disponibles
              </p>
              <h2 class="mb-0 text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-5xl">
                Une meme ambiance, plusieurs points d’entree.
              </h2>
            </div>
            <p class="mb-0 max-w-2xl text-sm leading-7 text-slate-300">
              La lecture commence par l’image, puis la fiche produit prend le relais avec une page dediee a chaque tirage.
            </p>
          </div>

          <div class="grid gap-5 xl:grid-cols-2">
            <article
              v-for="(item, index) in products"
              :key="item.slug"
              class="group overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/65 transition duration-300 hover:border-amber-300/35"
              :class="index % 3 === 0 ? 'xl:grid xl:grid-cols-[1.15fr_minmax(0,0.85fr)]' : ''"
            >
              <NuxtLink
                :to="item.to"
                class="relative block overflow-hidden"
                :class="index % 3 === 0 ? 'min-h-[24rem]' : 'min-h-[19rem]'"
              >
                <RunImage
                  v-if="item.heroImage"
                  class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  :src="item.heroImage"
                  :alt="item.title"
                  variant="card"
                  :sizes="index % 3 === 0 ? '(max-width: 1279px) 100vw, 48vw' : '(max-width: 1279px) 100vw, 36vw'"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div class="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div class="flex items-center gap-3 text-xs uppercase tracking-[0.26em] text-slate-200/90">
                    <span class="rounded-full border border-white/15 bg-black/35 px-3 py-1 backdrop-blur-sm">
                      {{ item.stockLabel }}
                    </span>
                    <span v-if="item.priceLabel" class="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-amber-100">
                      {{ item.priceLabel }}
                    </span>
                  </div>
                </div>
              </NuxtLink>

              <div class="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
                <div class="space-y-3">
                  <p class="mb-0 text-[0.68rem] uppercase tracking-[0.3em] text-slate-400">
                    Piece {{ padNumber(index + 1) }}
                  </p>
                  <NuxtLink
                    :to="item.to"
                    class="block text-2xl font-semibold leading-tight tracking-[-0.04em] text-slate-50 transition hover:text-amber-100 sm:text-3xl"
                  >
                    {{ item.title }}
                  </NuxtLink>
                  <p class="mb-0 text-sm leading-7 text-slate-300">
                    {{ item.summary }}
                  </p>
                </div>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <NuxtLink
                    :to="item.to"
                    class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
                  >
                    Voir le tirage
                    <span aria-hidden="true">↗</span>
                  </NuxtLink>

                  <BuyButton v-if="item.canBuy" :product="item.raw" />
                </div>
              </div>
            </article>
          </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import moment from 'moment'
import { findRunEntryBySlug } from '~/composables/useContentCollections'
import {
  getGallerySources,
  getProductHeroImage,
  getRunImageUrl,
  getSeriesCoverImage,
  getSeriesHeroImage,
} from '../../../utils/runs'
import { toAbsoluteUrl } from '../../../utils/run-media'

type ProductEntry = {
  sku?: string
  title?: string
  slug?: string
  description?: string
  price?: number
  stock?: number
  heroImage?: string
  images?: string[]
  gallery?: Array<{ src?: string; alt?: string; caption?: string; orientation?: string }>
}

moment.locale('fr')

const route = useRoute()

definePageMeta({
  layout: 'default',
})

const serie = await findRunEntryBySlug(String(route.params.slug || ''))

if (!serie) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Serie introuvable',
  })
}

const coverImage = getSeriesCoverImage(serie)
const heroImage = getSeriesHeroImage(serie)
const seriesImages = getGallerySources(serie?.gallery)
const products = computed(() =>
  ((serie?.products || []) as ProductEntry[]).map((product, index) => {
    const priceValue = Number(product.price || 0)
    const stockValue = Number(product.stock || 0)

    return {
      raw: product,
      slug: product.slug || '',
      to: `/series/${serie.slug}/${product.slug || ''}`,
      title: product.title || `Tirage ${index + 1}`,
      heroImage: getProductHeroImage(product),
      summary: getProductSummary(product, serie?.description),
      priceLabel: priceValue > 0 ? `${priceValue}€` : '',
      stockLabel: stockValue > 0 ? `${stockValue} exemplaire${stockValue > 1 ? 's' : ''}` : 'Epuise',
      canBuy: stockValue > 0 && priceValue > 0,
    }
  }),
)

const productCountLabel = computed(() => {
  const count = products.value.length
  return `${count} tirage${count > 1 ? 's' : ''}`
})

const seriesHighlights = computed(() => {
  const fallbackImages = products.value
    .map((product) => ({
      src: product.heroImage,
      alt: product.title,
    }))
    .filter((image) => Boolean(image.src))

  return (seriesImages.length > 0
    ? seriesImages.map((src, index) => ({
        src,
        alt: serie?.gallery?.[index]?.alt || serie?.title || `Vue ${index + 1}`,
      }))
    : fallbackImages
  ).slice(0, 3)
})

const heroNotes = computed(() => [
  {
    label: 'Lecture',
    value: 'Une page qui pose le contexte avant de te laisser choisir une oeuvre.',
  },
  {
    label: 'Selection',
    value: productCountLabel.value,
  },
  {
    label: 'Atmosphere',
    value: heroImage ? 'Un hero visuel plein cadre pour garder l’intensite de la serie.' : 'La narration prend le relais quand la serie est moins imagee.',
  },
])

const collectorDetails = computed(() => [
  {
    label: 'Edition',
    value: 'Chaque fiche detaille le stock restant et la piece la plus adaptee a ton espace.',
  },
  {
    label: 'Parcours',
    value: 'Serie d’abord, oeuvre ensuite: le choix garde une logique editoriale au lieu d’un simple catalogue.',
  },
  {
    label: 'Signal',
    value: serie?.description || 'Une selection resserree, pensee comme un ensemble cohérent.',
  },
])

const socialImage = getRunImageUrl(heroImage || coverImage, 'social')
const socialImageUrl = toAbsoluteUrl(socialImage, 'https://macojaune.com')
const title = `Serie photo ${serie.title} - Macojaune.com`

useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title,
    },
    {
      name: 'description',
      content: serie.description,
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://macojaune.com${route.path}` },
    { property: 'og:title', content: `Decouvre la serie ${serie.title} sur le site de @macojaune` },
    {
      property: 'og:description',
      content: serie.description,
    },
    { property: 'og:image', content: socialImageUrl },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    { property: 'twitter:url', content: `https://macojaune.com${route.path}` },
    { property: 'twitter:title', content: `Decouvre la serie ${serie.title} sur le site de @macojaune` },
    {
      property: 'twitter:description',
      content: serie.description,
    },
    { property: 'twitter:image', content: socialImageUrl },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'http://schema.org/',
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
              '@id': 'https://macojaune.com/shop',
              name: 'Boutique',
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': `https://macojaune.com${route.fullPath}`,
              name: serie.title,
            },
          },
        ],
      }),
    },
  ],
})

const formatDate = (date: string) => moment(date).format('ll')

function getProductSummary(product: ProductEntry, fallbackDescription?: string) {
  const source = product.description || fallbackDescription || ''
  return source.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim() || 'Tirage numerote, photographie signee et piece choisie dans l’univers Macojaune.'
}

function padNumber(value: number) {
  return value.toString().padStart(2, '0')
}
</script>

<style lang="stylus" scoped>
.series-copy :deep(p)
  color #d7dee9
  margin-bottom 1rem

.series-copy :deep(a)
  color #fcd34d
  text-decoration none

.series-copy :deep(a:hover)
  color #fde68a
</style>
