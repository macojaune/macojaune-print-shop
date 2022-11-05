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
          nuxt-img.primary.border-radius(v-if="product.images" :aspect-ratio="5/4" :src="`/pictures${product.images[0]}`" fit="cover" @click="openModal(product)" class="" )
          p.my-2.text-2xl.text-center.text-amber-400.font-semibold {{product.price}}€
          p.text-center.text-white
            | {{product.title}}
            br
            span.text-caption.text-decoration-line-through(v-if="product.stock >0") Édition limitée à {{product.stock}} exemplaires
            span.font-bold.text-red-500(v-else) Épuisé
          .flex.justify-center.pt-4
            button.snipcart-add-item.px-8.py-2.rounded.bg-yellow-400.text-black.font-bold(class="hover:bg-amber-400 active:bg-amber-500" :data-item-id="product.sku"
          :data-item-name="product.title"
          :data-item-price="product.price"
          :data-item-image="`/pictures/${product.images[0]}`"
          :data-item-max-quantity="product.stock"
          :data-item-url="`https://macojaune.com${router.path}`" ) J'en veux
      //- template(v-if="modalProduct.images.length >1")
      //-   .col
      //-     .carousel(hide-delimiters height="auto" v-show="showImage")
      //-       .carousel-item(v-for="(image, i) in modalProduct.images" :key="i")
      //-         img.ma-3(contain :src="`/pictures${image}`")
      //-   .card-text
      //-     .row
      //-       .col(cols="3" md="2" v-for="(image,i) in modalProduct.images" :key="i")
      //-         img(contain :src="`/pictures${image}?nf_resize=fit&w=400`" @click="showImage=i" )
      //- template(v-else)
      //-   .col
      //-     img.ma-3(contain :src="`/pictures${modalProduct.images[0]}`")
</template>

<script setup>
import moment from "moment";
import { reactive } from "vue";

moment.locale("fr");
const router = useRoute();
definePageMeta({
  layout: "default",
});

const state = reactive({ showModal: false, showImage: 0, modalProduct: null });
//
const formatDate = (date) => moment(date).format("ll");
const openModal = (product) => {
  if (product.stock > 0) {
    state.modalProduct = product;
    state.showModal = !state.showModal;
    //$gtm.push({event: 'showDetails', product})
  }
};
</script>

<style lang="stylus" scoped></style>
