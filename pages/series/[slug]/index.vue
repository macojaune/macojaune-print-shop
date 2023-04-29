<template lang="pug">
.serie-page.px-4
  ContentRenderer(:value="serie")
    .content
      h1.mt-6.mb-3.text-5xl.uppercase.text-amber-500.font-display {{serie.title}}
        |
        small.font-sans.text-sm.text-white {{formatDate(serie.date)}}
      ContentRendererMarkdown.text-white.text-lg(class="text-base md:text-lg" :value="serie")
      .picture-list.my-6.grid.grid-flow-row-dense.gap-4.justify-evenly.items-end(:class="`grid-cols-1 ${serie.products.length>2?'md:grid-cols-3':'md:grid-cols-2'}`")
        .picture(v-for="(product, index) in serie.products" :key="index")
          NuxtLink(:to="product.slug" )
            NuxtImg.primary.border-radius.mb-2(
              v-if="product.images"
              :src="`/pictures${product.images[0]}`"
              sizes="xs:100vw lg:500px"
              format="webp"
              quality="60"
              itemprop="image"
              :alt="product.title")
            p.text-2xl.text-center.text-amber-400.font-semibold(v-if="product.price") {{product.price}}€
              Meta(itemprop="price" :content="product.price")
              Meta(itemprop="priceCurrency" content="EUR")
            p.mt-2.text-2xl.text-center.text-white.font-display(itemprop="name")
              | {{product.title}}
              br
              span.font-sans.text-base.text-caption.text-decoration-line-through(v-if="product.stock>0" itemprop="availability" href="http://schema.org/InStock") Édition limitée à {{product.stock}} exemplaires
              span.font-bold.text-red-500(v-else itemprop="availability" href="http://schema.org/OutOfStock") Épuisé
          .flex.justify-center.pt-4(v-if="product.stock>0&&product.price")
            button.snipcart-add-item.px-8.py-2.rounded.bg-yellow-400.text-black.font-bold(
              class="hover:bg-amber-400 active:bg-amber-500"
              :data-item-id="product.sku"
          :data-item-name="product.title"
          :data-item-price="product.price"
          :data-item-image="`/pictures/${product.images[0]}`"
          :data-item-max-quantity="product.stock"
          :data-item-url="`https://macojaune.com${router.path}/${product.slug}`" ) Ajouter au panier
</template>

<script lang="ts" setup>
import moment from 'moment'
moment.locale('fr')

const router = useRoute()

definePageMeta({
  layout: 'default'
})
const serie = await queryContent('runs').where({ slug: router.params.slug }).findOne()
const title = 'Série photo ' + serie.title + ' - Macojaune.com'
useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title
    },
    {
      name: 'description',
      content: serie.description
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: `https://macojaune.com${router.path}` },
    { property: 'og:title', content: `Découvre la série ${serie.title} sur le site de @macojaune` },
    {
      property: 'og:description',
      content: serie.description
    },
    { property: 'og:image', content: `https://macojaune.com/pictures/${serie?.products?.[0].images?.[0]}` },
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    { property: 'twitter:url', content: `https://macojaune.com${router.path}` },
    { property: 'twitter:title', content: `Découvre la série ${serie.title} sur le site de @macojaune` },
    {
      property: 'twitter:description',
      content: serie.description
    },
    { property: 'twitter:image', content: `https://macojaune.com/pictures/${serie?.products?.[0].images?.[0]}` }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'http://schema.org/',
        '@type': 'BreadcrumbList',

        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            item: {
              '@id': 'https://macojaune.com',
              name: 'Homepage'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com' + router.fullPath,
              name: serie.title
            }
          }
        ]
      })
    }
  ]
})

const formatDate = (date: string) => moment(date).format('ll')

</script>
