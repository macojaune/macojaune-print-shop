<template lang="pug">
  v-container.serie
    v-row
      v-col
        h1.text-uppercase {{data.title}}
        small.text-caption {{$formatDate(data.date)}}
        p {{data.description}}
    v-row(justify="center")
      v-col(cols="12" md="4" v-for="(product, index) in data.products" :key="index")
        article
          v-img.primary(:aspect-ratio="5/4" :src="product.image" @click="openModal(product)")
          v-btn.buy-button.snipcart-add-item( color="red" text large block :data-item-id="product.sku"
            :data-item-name="product.title"
            :data-item-price="product.price"
            :data-item-image="product.image"
            :data-item-max-quantity="product.stock"
            :data-item-url="`https://yellowartshop.netlify.app${currentUrl}`") {{product.price}}€
          p.text-center.product-title {{product.title}}
            br
            span.text-caption Édition limitée à {{product.stock}} exemplaires
    v-dialog(v-model="showModal" dark  max-width="66%" overlay-color="#fbc02d" overlay-opacity="0.3")
      v-card(light v-if="modalProduct!==null")
        v-card-title
          | {{modalProduct.title}}
          v-spacer
          v-btn.buy-button.snipcart-add-item.pt-1(outlined tile color="red" large
            :data-item-id="modalProduct.sku"
            :data-item-name="modalProduct.title"
            :data-item-price="modalProduct.price"
            :data-item-image="modalProduct.image"
            :data-item-max-quantity="modalProduct.stock"
            :data-item-url="`https://yellowartshop.netlify.app${currentUrl}`"
            @click="showModal=false") J'en veux
        v-col
            v-img.ma-3(:src="modalProduct.image")
</template>

<script>
export default {
  name: 'SeriesSlugPage',
  async asyncData({ params: { slug }, route }) {
    const content = await import(`~/contents/runs/${slug}.md`)
    return {
      data: content.attributes,
      html: content.html,
      currentUrl: route.path,
    }
  },
  data() {
    return {
      showModal: false,
      modalProduct: null,
    }
  },
  methods: {
    openModal(product) {
      this.modalProduct = product
      this.showModal = !this.showModal
    },
  },
}
</script>

<style lang="stylus" scoped>
h1
  color var(--v-secondary-base)
.buy-button
  font-size 33px
</style>
