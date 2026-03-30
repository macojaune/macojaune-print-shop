<template>
  <div class="product-page pb-12 pt-6 sm:pb-16 lg:pb-24">
    <div class="space-y-10 sm:space-y-12 lg:space-y-16">
      <section class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_24rem] lg:gap-8">
          <div class="space-y-5">
            <NuxtLink
              :to="`/series/${serie.slug}`"
              class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 transition duration-200 hover:border-amber-300/50 hover:text-amber-100"
            >
              Retour a la serie {{ serie.title }}
              <span aria-hidden="true">↗</span>
            </NuxtLink>

            <article class="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/75 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_26%)]" />
              <RunImage
                v-if="heroImage"
                class="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen"
                :src="heroImage"
                :alt="product.title"
                variant="detail"
                sizes="(max-width: 1023px) 100vw, 64vw"
                loading="eager"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-slate-950/35" />

              <div class="relative flex min-h-[28rem] flex-col justify-between p-6 sm:p-8 lg:min-h-[38rem] lg:p-10">
                <div class="flex flex-wrap gap-3 text-xs uppercase tracking-[0.28em] text-slate-200">
                  <span class="rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-sm">
                    Piece unique
                  </span>
                  <span class="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-amber-100">
                    {{ stockLabel }}
                  </span>
                </div>

                <div class="max-w-3xl space-y-5">
                  <p class="mb-0 text-xs uppercase tracking-[0.34em] text-amber-300/90">
                    Tirage de la serie {{ serie.title }}
                  </p>
                  <h1 class="mb-0 text-4xl font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-slate-50 sm:text-5xl lg:text-7xl" itemprop="name">
                    {{ product.title }}
                  </h1>
                  <p class="mb-0 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                    {{ productSummary }}
                  </p>
                </div>
              </div>
            </article>
          </div>

          <aside class="lg:sticky lg:top-28 lg:self-start">
            <div class="space-y-5 rounded-[30px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:p-7">
              <div>
                <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                  Edition
                </p>
                <p class="mb-0 text-4xl font-semibold tracking-[-0.05em] text-slate-50">
                  {{ priceLabel }}
                </p>
              </div>

              <div class="grid gap-3">
                <div
                  v-for="detail in productFacts"
                  :key="detail.label"
                  class="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
                >
                  <p class="mb-1 text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">
                    {{ detail.label }}
                  </p>
                  <p class="mb-0 text-sm leading-7 text-slate-100">
                    {{ detail.value }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <BuyButton v-if="canBuy" :product="product" />
                <p v-else class="mb-0 rounded-[20px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm leading-7 text-red-100">
                  Cette piece n’est plus disponible. Tu peux revenir a la serie pour explorer les autres tirages.
                </p>

                <NuxtLink
                  :to="`/series/${serie.slug}`"
                  class="inline-flex w-full items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100"
                >
                  Revoir la serie complete
                  <span aria-hidden="true">↗</span>
                </NuxtLink>
              </div>
            </div>
          </aside>
      </section>

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <article class="rounded-[28px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-8">
            <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                  Piece et contexte
                </p>
                <h2 class="mb-0 text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-4xl">
                  Ce qu’il faut ressentir avant d’ajouter au panier.
                </h2>
              </div>
              <p class="mb-0 max-w-md text-sm leading-7 text-slate-400">
                La fiche reste resserree pour mieux servir l’oeuvre, pas pour multiplier les panneaux e-commerce.
              </p>
            </div>

            <div class="product-copy space-y-5 text-base leading-8 text-slate-200">
              <p
                v-for="(paragraph, index) in productParagraphs"
                :key="index"
                class="mb-0"
              >
                {{ paragraph }}
              </p>
            </div>
          </article>

          <aside class="space-y-4">
            <div
              v-for="insight in sideNotes"
              :key="insight.label"
              class="rounded-[24px] border border-white/10 bg-slate-950/60 p-5"
            >
              <p class="mb-2 text-[0.68rem] uppercase tracking-[0.28em] text-amber-300/90">
                {{ insight.label }}
              </p>
              <p class="mb-0 text-sm leading-7 text-slate-200">
                {{ insight.value }}
              </p>
            </div>
          </aside>
      </section>

      <section class="space-y-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                Galerie
              </p>
              <h2 class="mb-0 text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-5xl">
                Variations, details, respiration.
              </h2>
            </div>
            <p class="mb-0 max-w-2xl text-sm leading-7 text-slate-300">
              Chaque image garde de l’espace autour d’elle pour que le tirage reste le sujet principal.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            <article
              v-for="(image, index) in galleryItems"
              :key="`${image.src}-${index}`"
              class="group overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/60"
              :class="index === 0 ? 'xl:col-span-7' : index === 1 ? 'xl:col-span-5' : index % 3 === 0 ? 'xl:col-span-4' : 'xl:col-span-4'"
            >
              <RunImage
                class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                :src="image.src"
                :alt="image.alt"
                variant="detail"
                :sizes="index < 2 ? '(max-width: 1279px) 100vw, 50vw' : '(max-width: 1279px) 100vw, 33vw'"
              />
            </article>
          </div>
      </section>

      <section v-if="relatedProducts.length > 0" class="space-y-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="mb-2 text-xs uppercase tracking-[0.32em] text-amber-300/90">
                Meme serie, autre angle
              </p>
              <h2 class="mb-0 text-3xl font-semibold tracking-[-0.04em] text-slate-50 sm:text-5xl">
                D’autres pieces gardent le fil narratif ouvert.
              </h2>
            </div>
            <NuxtLink
              :to="`/series/${serie.slug}`"
              class="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 transition hover:text-amber-200"
            >
              Voir toute la serie
              <span aria-hidden="true">↗</span>
            </NuxtLink>
          </div>

          <div class="grid gap-5 lg:grid-cols-2">
            <NuxtLink
              v-for="item in relatedProducts"
              :key="item.slug"
              :to="item.to"
              class="group grid overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 transition duration-300 hover:border-amber-300/35 sm:grid-cols-[14rem_minmax(0,1fr)]"
            >
              <RunImage
                v-if="item.image"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                :src="item.image"
                :alt="item.title"
                variant="card"
                sizes="(max-width: 1023px) 100vw, 16rem"
              />

              <div class="flex flex-col justify-between gap-4 p-5 sm:p-6">
                <div class="space-y-3">
                  <p class="mb-0 text-[0.68rem] uppercase tracking-[0.28em] text-slate-400">
                    Serie {{ serie.title }}
                  </p>
                  <h3 class="mb-0 text-2xl font-semibold tracking-[-0.04em] text-slate-50">
                    {{ item.title }}
                  </h3>
                  <p class="mb-0 text-sm leading-7 text-slate-300">
                    {{ item.summary }}
                  </p>
                </div>
                <div class="flex items-center gap-3 text-sm font-semibold text-amber-100">
                  Voir la fiche
                  <span aria-hidden="true" class="transition duration-300 group-hover:translate-x-1">↗</span>
                </div>
              </div>
            </NuxtLink>
          </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { findRunEntryBySlug } from '~/composables/useContentCollections'
import { getProductHeroImage, getProductImages, getRunImageUrl } from '../../../utils/runs'
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

const product = (serie.products || []).find(
  (entry: ProductEntry) => entry.slug === route.params.productSlug,
) as ProductEntry

if (!product) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Produit introuvable',
  })
}

const productImages = getProductImages(product)
const heroImage = getProductHeroImage(product)
const productSummary = stripHtml(product.description || serie.description || '')
const productParagraphs = toParagraphs(product.description || serie.description || '')
const galleryItems = computed(() => {
  const gallery = (product.gallery || []).map((image, index) => ({
    src: image.src || productImages[index] || '',
    alt: image.alt || product.title || `Vue ${index + 1}`,
  }))

  if (gallery.length > 0) {
    return gallery.filter((image) => Boolean(image.src))
  }

  return productImages.map((src, index) => ({
    src,
    alt: product.title || `Vue ${index + 1}`,
  }))
})

const priceValue = Number(product.price || 0)
const stockValue = Number(product.stock || 0)
const canBuy = stockValue > 0 && priceValue > 0
const stockLabel = stockValue > 0 ? `${stockValue} exemplaire${stockValue > 1 ? 's' : ''} restant${stockValue > 1 ? 's' : ''}` : 'Edition epuisee'
const priceLabel = priceValue > 0 ? `${priceValue}€` : 'Sur demande'

const productFacts = computed(() => [
  {
    label: 'Prix',
    value: priceLabel,
  },
  {
    label: 'Disponibilite',
    value: stockLabel,
  },
  {
    label: 'Serie',
    value: serie.title,
  },
])

const sideNotes = computed(() => [
  {
    label: 'Lecture',
    value: 'Une seule oeuvre prend la lumiere, avec une mise en page volontairement calme pour ne pas casser l’impact de l’image.',
  },
  {
    label: 'Achat',
    value: canBuy ? 'Le CTA reste direct, sans friction supplementaire, avec les infos d’edition visibles avant l’action.' : 'La fiche reste utile meme hors stock pour conserver la memoire de la serie et guider vers les autres pieces.',
  },
  {
    label: 'Contexte',
    value: serie.description || 'Le tirage s’inscrit dans une narration plus large portee par la serie complete.',
  },
])

const relatedProducts = computed(() =>
  ((serie.products || []) as ProductEntry[])
    .filter((entry) => entry.slug && entry.slug !== product.slug)
    .slice(0, 2)
    .map((entry) => ({
      slug: entry.slug as string,
      to: `/series/${serie.slug}/${entry.slug}`,
      title: entry.title || 'Autre tirage',
      image: getProductHeroImage(entry),
      summary: stripHtml(entry.description || serie.description || ''),
    })),
)

const socialImage = getRunImageUrl(heroImage, 'social')
const socialImageUrl = toAbsoluteUrl(socialImage, 'https://macojaune.com')
const title = `${product.title} - Serie ${serie.title} - Macojaune.com`

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
    { property: 'og:title', content: `Decouvre la photo ${product.title} de la serie ${serie.title} sur le site de @macojaune` },
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
              '@id': `https://macojaune.com/series/${route.params.slug}`,
              name: serie.title,
            },
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': `https://macojaune.com${route.fullPath}`,
              name: product.title,
            },
          },
        ],
      }),
    },
  ],
})

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Tirage numerote, photographie signee et edition limitee.'
}

function toParagraphs(value: string) {
  const normalized = value
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')

  const paragraphs = normalized
    .split(/\n+/)
    .map((entry) => entry.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs : ['Tirage numerote, photographie signee et edition limitee.']
}
</script>

<style lang="stylus" scoped>
.product-copy :deep(p)
  color #d7dee9
  margin-bottom 1rem

.product-copy :deep(a)
  color #fcd34d
  text-decoration none

.product-copy :deep(a:hover)
  color #fde68a
</style>
