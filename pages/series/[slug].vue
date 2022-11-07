<template lang="pug">
.serie-page.px-4
  ContentDoc(:path="`/runs/${$route.params.slug}`" v-slot="{doc}")
    .content
      h1.mt-6.mb-3.text-5xl.uppercase.text-amber-500.font-display {{doc.title}}
        | 
        small.font-sans.text-sm.text-white {{formatDate(doc.date)}}
      ContentRenderer.text-white.text-lg(class="text-base md:text-lg" :value="doc")
      .picture-list.my-6.grid.grid-flow-row-dense.gap-4.justify-evenly.items-end(:class="`grid-cols-1 ${doc.products.length>2?'md:grid-cols-3':'md:grid-cols-2'}`")
        .picture(v-for="(product, index) in doc.products" :key="index" class="hover:cursor-pointer" )
          nuxt-img.primary.border-radius.mb-2(v-if="product.images" :aspect-ratio="5/4" :src="`@/public/pictures${product.images[0]}`" fit="cover" @click="openModal(product)" itemprop="image" :alt="product.title")
          p.text-2xl.text-center.text-amber-400.font-semibold(v-if="product.price") {{product.price}}€
            Meta(itemprop="price" :content="product.price")
            Meta(itemprop="priceCurrency" content="EUR")
          p.mt-2.text-center.text-white(itemprop="name")
            | {{product.title}}
            br
            span.text-caption.text-decoration-line-through(v-if="product.stock>0" itemprop="availability" href="http://schema.org/InStock") Édition limitée à {{product.stock}} exemplaires
            span.font-bold.text-red-500(v-else itemprop="availability" href="http://schema.org/OutOfStock") Épuisé
          .flex.justify-center.pt-4(v-if="product.stock>0&&product.price")
            button.snipcart-add-item.px-8.py-2.rounded.bg-yellow-400.text-black.font-bold(
              class="hover:bg-amber-400 active:bg-amber-500"
              :data-item-id="product.sku"
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

<script lang="ts" setup>
import moment from "moment";
import { reactive } from "vue";

moment.locale("fr");
const router = useRoute();
definePageMeta({
  layout: "default",
});
const { title } = await queryContent("/runs/" + router.params.slug).findOne();
useHead({
  title: title + " - Macojaune.com",
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "http://schema.org/",
        "@type": "BreadcrumbList",

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@id": "https://macojaune.com",
              name: "Homepage",
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            item: {
              "@id": "https://macojaune.com" + router.fullPath,
              name: title,
            },
          },
        ],
      }),
    },
  ],
});
const state = reactive<{
  showModal: boolean;
  showImage: number;
  modalProduct: Product | null;
}>({
  showModal: false,
  showImage: 0,
  modalProduct: null,
});
type Product = {
  stock: number;
  images?: string[];
  price?: number;
  title: string;
};
const formatDate = (date: string) => moment(date).format("ll");
const openModal = (product: Product) => {
  if (product.stock > 0) {
    state.modalProduct = product;
    state.showModal = !state.showModal;
    //$gtm.push({event: 'showDetails', product})
  }
};
</script>
