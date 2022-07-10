<template lang="pug">
.homepage.px-4
  ContentList.runs( path="/runs" v-slot="{list}")
    .run(v-for="run in list" :key="run._path" class="mb-12 md:mt-12 flex flex-col md:flex-row justify-between items-between")
      .run-text(class="basis-full md:basis-2/4 mt-3 md:mt-0  order-2 md:order-1")
        small.run-date.text-white {{formatDate(run.date)}}
        br
        NuxtLink.mb-2.run-title.uppercase.text-amber-400(class="text-4xl md:text-7xl hover:text-orange-600" :to="`/series/${run.slug}`") {{run.title}}
        p.run-description.text-white {{run.description}}
      .run-pictures.flex.flex-row.items-center.gap-3(class="basis-full md:basis-2/5 order-1 md:order-2")
          .run-picture.bg-black.rounded-md(v-for="(product, index) in run.products.slice(0,3)" :key="index" class="hover:scale-150 hover:rounded-none transition-all ease-in-out")
            NuxtLink.bg-yellow-500(:to="`/series/${run.slug}`")
              img.w-full.h-full(v-if="product.images.length>0" :src="`/pictures${product.images[0]}?nf_resize=fit&w=400`")
              span.white--text(v-else) {{product.title}}
    //template(#not-found)
    //  .empty
    //    h3.text-center.warning--text Oups ! Pas de série disponible à la vente.
</template>

<script setup>
import moment from "moment";
moment.locale('fr-FR')
const formatDate = (date)=> moment(date).format('ll')

</script>

<style lang="stylus" scoped>
.run-title
    font-family 'Righteous'
</style>
