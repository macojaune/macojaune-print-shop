<template lang="pug">
.shop-page(class="w-full px-4")
  .list.runs.flex.flex-col-reverse.gap-12
    .run(v-for="run in runs" :key="run.slug" class="flex flex-col lg:flex-row justify-between items-between")
      .run-text(class="basis-full lg:basis-2/4 mt-3 lg:mt-0 order-2 lg:order-1")
        small.run-date.text-white {{formatDate(run.date)}}
        br
        NuxtLink.mb-2.uppercase.text-amber-400.font-display(class="text-4xl lg:text-7xl hover:text-orange-600" :to="`/series/${run.slug}/`") {{run.title}}
        p.run-description.text-white {{run.description}}
      .run-pictures.flex.gap-3(class="basis-full lg:basis-2/5 order-1 lg:order-2")
        .run-picture.grow(v-for="(product, index) in run.products.slice(0,3)" :key="product.slug || index" class="hover:scale-150 hover:rounded-none transition-all ease-in-out")
          NuxtLink.h-full(:to="`/series/${run.slug}/${product.slug}`")
            RunImage.rounded-md.h-full(
              v-if="getProductImages(product).length > 0"
              :src="getProductImages(product)[0]"
              variant="card"
              sizes="(max-width: 1023px) 33vw, 300px"
              :loading="index>1 ? 'lazy':''"
              :alt="(index+1) + '-'+product.title")
            span.white--text(v-else) {{product.title}}
</template>

<script lang="ts" setup>
import moment from 'moment'
import { getRunEntries } from '~/composables/useContentCollections'
import { getProductImages, getRunImageUrl } from "../utils/runs"
import { toAbsoluteUrl } from "../utils/run-media"

moment.locale('fr-FR')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatDate = (date: string) => moment(date).format('ll')
const runs = await getRunEntries()
const heroImage = getProductImages(runs[0]?.products?.[0])[0] || ''
const socialImage = toAbsoluteUrl(getRunImageUrl(heroImage, 'social'), 'https://macojaune.com')

const description =
  "Offrez-vous un morceau de l'univers artistique de Macojaune avec sa sélection de tirages photographiques uniques. Chacune de ces œuvres a été soigneusement sélectionnée pour représenter l'esthétique fascinante et la créativité débordante de notre photographe-entrepreneur-développeur ultra curieux. Nos tirages sont imprimés sur des matériaux de haute qualité pour garantir une durabilité à long terme et une expérience visuelle inoubliable. Vous pouvez les offrir en cadeau ou les garder pour vous-même pour ajouter une touche d'originalité et de beauté à votre environnement. Parcourez notre sélection de tirages photographiques dès maintenant et laissez-vous transporter dans l'univers Macojaune !"
useHead({
  title: 'Yellow art shop - La boutique du Macojaune',
  meta: [
    {
      name: 'title',
      content: 'Achetez les Tirages Uniques de Macojaune - Photographe-Entrepreneur-Développeur Ultra Curieux'
    },
    {
      name: 'description',
      content: description
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/shop' },
    { property: 'og:title', content: 'YELLOW ART SHOP' },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: socialImage },
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/shop' },
    { property: 'twitter:title', content: 'YELLOW ART SHOP' },
    {
      property: 'twitter:description',
      content: description
    },
    { property: 'twitter:image', content: socialImage }
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
              '@id': 'https://macojaune.com/',
              name: 'Macojaune.com'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/shop',
              name: 'La Boutique du Macojaune'
            }
          }
        ]
      })
    }
  ]
})
</script>

<style scoped>

</style>
