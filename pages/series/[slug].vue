<template lang="pug">
.serie-page.px-4
  ContentDoc(:path="`/runs/${$route.params.slug}`" v-slot="{doc}")
    .content
      h1.mt-6.mb-3.text-5xl.uppercase.text-amber-500 {{doc.title}}
        | 
        small.text-sm.text-white {{formatDate(doc.date)}}
      ContentRenderer.text-white.text-lg(class="text-base md:text-lg" :value="doc")
      .picture-list.my-6.grid.grid-flow-row-dense.gap-4.justify-evenly( class="grid-cols-1 md:grid-cols-3")
        .picture(v-for="(product, index) in doc.products" :key="index" class="hover:cursor-pointer" )
          img.primary.border-radius(v-if="product.images" :aspect-ratio="5/4" :src="`/pictures${product.images[0]}?nf_resize=fit&w=400`" @click="openModal(product)")
          p.my-2.text-2xl.text-center.text-amber-400.font-semibold {{product.price}}€
          p.text-center.text-white
            | {{product.title}}
            br
            span.text-caption.text-decoration-line-through(v-if="product.stock >0") Édition limitée à {{product.stock}} exemplaires
            span.font-bold.text-red-500(v-else) Épuisé
  .comments
      h3.text-3xl.uppercase.text-white Laisse-moi ton avis
  //  Disqus
  //.dialog(v-show="showModal" dark max-width="88%" overlay-color="#fbc02d" overlay-opacity="0.3")
  //  .card( v-if="modalProduct!==null")
  //    .card-title {{modalProduct.title}}
  //      .spacer
  //      button(@click="showModal = false")
  //        span.icon mdi-close
  //    template(v-if="modalProduct.images.length >1")
  //      .col
  //        .carousel(hide-delimiters height="auto" v-show="showImage")
  //          .carousel-item(v-for="(image, i) in modalProduct.images" :key="i")
  //            img.ma-3(contain :src="`/pictures${image}`")
  //      .card-text
  //        .row
  //          .col(cols="3" md="2" v-for="(image,i) in modalProduct.images" :key="i")
  //            img(contain :src="`/pictures${image}?nf_resize=fit&w=400`" @click="showImage=i" )
  //    template(v-else)
  //      .col
  //        img.ma-3(contain :src="`/pictures${modalProduct.images[0]}`")
</template>

<script setup>
import moment from "moment"
import {reactive }from "vue"

moment.locale('fr')

definePageMeta({
  layout: "default"
})

const state = reactive({showModal:false, showImage:0, modalProduct:null})
//    
const formatDate = (date) => moment(date).format('ll')
const openModal = (product) => {
  if (product.stock > 0) {
    state.modalProduct = product
    state.showModal = !state.showModal
    //$gtm.push({event: 'showDetails', product})
  }
}   
</script>

<style lang="stylus" scoped>
</style>
