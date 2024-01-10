<template lang="pug">
.shop-page(class="w-full px-4")
  ContentList(v-slot="{list}" path="/runs" )
    .list.runs.flex.flex-col-reverse.gap-12
      .run(v-for="run in list" :key="run._path" class="flex flex-col lg:flex-row justify-between items-between")
        .run-text(class="basis-full lg:basis-2/4 mt-3 lg:mt-0  order-2 lg:order-1")
          small.run-date.text-white {{formatDate(run.date)}}
          br
          NuxtLink.mb-2.uppercase.text-amber-400.font-display(class="text-4xl lg:text-7xl hover:text-orange-600" :to="`/series/${run.slug}/`") {{run.title}}
          p.run-description.text-white {{run.description}}
        .run-pictures.flex.gap-3(class="basis-full lg:basis-2/5 order-1 lg:order-2")
          .run-picture.grow(v-for="(product, index) in run.products.slice(0,3)" :key="index" class="hover:scale-150 hover:rounded-none transition-all ease-in-out")
            NuxtLink.h-full(:to="`/series/${run.slug}/${product.slug}`")
              nuxt-img.rounded-md.h-full(
                v-if="product.images.length>0"
                :src="product.images[0]"
                sizes="xs:33vw lg:300px"
                format="webp"
                :loading="index>1 ? 'lazy':''"
                :alt="(index+1) + '-'+product.title"
                quality="30")
              span.white--text(v-else) {{product.title}}
      //template(#not-found)
      //  .empty
      //    h3.text-center.warning--text Oups ! Pas de série disponible à la vente.
</template>

<script lang="ts" setup>
import moment from 'moment'
moment.locale('fr-FR')
const formatDate = (date: string) => moment(date).format('ll')

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
    { property: 'og:url', content: 'https://macojaune.com/' },
    { property: 'og:title', content: 'YELLOW ART SHOP' },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: '/pictures/dsc06261.jpg' },
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/' },
    { property: 'twitter:title', content: 'YELLOW ART SHOP' },
    {
      property: 'twitter:description',
      content: description
    },
    { property: 'twitter:image', content: 'https://macojaune.com/pictures/dsc06261.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: [
        { '@context': 'http://schema.org/' },
        { '@type': 'BreadcrumbList' },
        {
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@id': 'https://macojaune.com/',
                name: 'Macojaune.com'
              }
            }, {
              '@type': 'ListItem',
              position: 2,
              item: {
                '@id': 'https://macojaune.com/shop',
                name: 'La Boutique du Macojaune'
              }
            }
          ]
        }
      ]
    }
  ]
})
</script>

<style scoped>

</style>
