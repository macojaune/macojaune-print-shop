<template lang="pug">
  v-container.serie
    v-row
      v-col
        h1.text-uppercase {{content.title}}
        small.text-caption {{$formatDate(content.date)}}
        nuxt-content.description(:document="content")
    v-row(justify="center")
      v-col(cols="12" md="4" v-for="(product, index) in content.products" :key="index")
        v-img.primary(v-if="product.images" :aspect-ratio="5/4" :src="`/pictures${product.images[0]}?nf_resize=fit&w=400`" @click="openModal(product)")
        v-avatar.white--text(v-else color="primary" tile width="100%" height="220px") {{product.title}}
        p.my-2.text-center.red--text {{product.price}}€
        p.text-center.product-title
          | {{product.title}}
          br
          span.text-caption Édition limitée à {{product.stock}} exemplaires
        v-btn.buy-button.snipcart-add-item(color="red" large block :data-item-id="product.sku"
          :data-item-name="product.title"
          :data-item-price="product.price"
          :data-item-image="`/pictures/${product.images[0]}`"
          :data-item-max-quantity="product.stock"
          :data-item-url="`https://macojaune.com${currentUrl}`") J'en veux
    v-dialog(v-model="showModal" dark max-width="88%" :fullscreen="$vuetify.breakpoint.smAndDown" overlay-color="#fbc02d" overlay-opacity="0.3")
      v-card( v-if="modalProduct!==null")
        v-card-title {{modalProduct.title}}
          v-spacer
          v-btn(rounded icon @click="showModal = false")
            v-icon mdi-close
        v-col
          v-carousel(hide-delimiters height="auto" v-model="showImage")
            v-carousel-item(v-for="(image, i) in modalProduct.images" :key="i")
              v-img.ma-3(contain :src="`/pictures${image}`")
        v-card-text
          v-row
            v-col(cols="3" md="2" v-for="(image,i) in modalProduct.images" :key="i")
              v-img(contain :src="`/pictures${image}?nf_resize=fit&w=400`" @click="showImage=i" )
        v-card-actions
          v-btn.buy-button.snipcart-add-item(color="red" large block :data-item-id="modalProduct.sku"
            :data-item-name="modalProduct.title"
            :data-item-price="modalProduct.price"
            :data-item-image="`/pictures/${modalProduct.images[0]}`"
            :data-item-max-quantity="modalProduct.stock"
            :data-item-url="`https://macojaune.com${currentUrl}`" @click="showModal=false") J'en veux
</template>

<script>
export default {
  name: 'SeriesSlugPage',
  async asyncData({ params, $content, route }) {
    try {
      const content = await $content('runs')
        .where({ slug: params.slug })
        .fetch()
      return {
        content: content[0],
        currentUrl: route.path,
      }
    } catch (e) {
      console.error(e)
    }
  },
  data() {
    return {
      showModal: false,
      showImage: 0,
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
