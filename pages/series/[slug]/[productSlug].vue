<template lang="pug">
.serie-page.px-4
    ContentRenderer(:value="serie")
        NuxtLink(to="./")
            p.mt-6.mb-3.text-2xl.uppercase.text-amber-400.font-display &lt; {{serie.title}}
        h1.mt-6.mb-3.text-5xl.uppercase.text-amber-500.font-display(itemprop="name") {{product.title}}
            br
            small.font-sans.text-sm.text-white.normal-case
                span.text-caption.text-decoration-line-through(v-if="product.stock>0" itemprop="availability" href="http://schema.org/InStock") Édition limitée à {{product.stock}} exemplaires
                span.font-bold.text-red-500(v-else itemprop="availability" href="http://schema.org/OutOfStock") Épuisé
        p.text-white.text-lg(class="text-base md:text-lg")
            ContentSlot(:use="$slots.default" v-html="product.description" )
        .flex.flex-col.justify-end.pt-4.gap-4.items-center(v-if="product.stock>0&&product.price")
            p.text-2xl.text-center.text-amber-400.font-semibold(v-if="product.price") {{product.price}}€
                Meta(itemprop="price" :content="product.price")
                Meta(itemprop="priceCurrency" content="EUR")
            button.snipcart-add-item.px-8.py-2.rounded.bg-yellow-400.text-black.font-bold(
                class="hover:bg-amber-400 active:bg-amber-500"
                :data-item-id="product.sku"
                :data-item-name="product.title"
                :data-item-price="product.price"
                :data-item-image="product.images[0]"
                :data-item-max-quantity="product.stock"
                :data-item-url="`https://macojaune.com${router.path}/${product.slug}`" ) Acheter
        .picture-list.my-6.grid.grid-flow-row-dense.gap-4.justify-around.items-end(:class="`grid-cols-1 ${product.images.length>2?'md:grid-cols-3':'md:grid-cols-2'}`")
            .picture(v-for="(imageURL, index) in product.images" :key="index" class="hover:cursor-pointer")
                NuxtImg.border-radius(:src="imageURL" sizes="xs:100vw lg:800px" quality="80" format="webp" itemprop="image" :alt="product.title")
</template>

<script lang="ts" setup>
const router = useRoute()
definePageMeta({
  layout: 'default'
})
const serie = await queryContent('runs').where({ slug: router.params.slug }).findOne()
const product = serie.products.find(
  (p: { slug: string | string[]; }) => p.slug === router.params.productSlug
)

const title = product.title + ' - Série ' + serie.title + ' - Macojaune.com'
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
    { property: 'og:title', content: `Découvre la photo ${product.title} de la série ${serie.title} sur le site de @macojaune` },
    {
      property: 'og:description',
      content: serie.description
    },
    { property: 'og:image', content: `https://macojaune.com/${serie?.products?.[0].images?.[0]}` },
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    { property: 'twitter:url', content: `https://macojaune.com${router.path}` },
    { property: 'twitter:title', content: `Découvre la série ${serie.title} sur le site de @macojaune` },
    {
      property: 'twitter:description',
      content: serie.description
    },
    { property: 'twitter:image', content: `https://macojaune.com${serie?.products?.[0].images?.[0]}` }
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
              name: 'Homepage'
            }
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/series/' + router.params.slug,
              name: router.params.slug
            }
          },
          {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': 'https://macojaune.com' + router.fullPath,
              name: router.params.productSlug
            }
          }
        ]
      })
    }
  ]
})
</script>

<style lang="stylus" scoped>
p a
 color var(--tw-yellow-500)
</style>
