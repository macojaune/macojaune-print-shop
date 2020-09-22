<template lang="pug">
  v-container.serie
    v-row
      v-col
        h1.text-uppercase {{content.title}}
        small.text-caption {{$formatDate(content.date)}}
        nuxt-content.description(:document="content")
    v-row(justify="center")
      v-col(cols="12" md="4" v-for="(product, index) in content.products" :key="index")
        article
          v-img.primary(:aspect-ratio="5/4" :src="require(`assets/pictures/${product.image[0]}`)" @click="openModal(product)")
          v-btn.buy-button.snipcart-add-item( color="red" text large block :data-item-id="product.sku"
            :data-item-name="product.title"
            :data-item-price="product.price"
            :data-item-image="require(`assets/pictures/${product.image[0]}`)"
            :data-item-max-quantity="product.stock"
            :data-item-url="`https://yellowartshop.netlify.app${currentUrl}`") {{product.price}}€
          p.text-center.product-title {{product.title}}
            br
            span.text-caption Édition limitée à {{product.stock}} exemplaires
    v-dialog(v-model="showModal" dark max-width="88%" overlay-color="#fbc02d" overlay-opacity="0.3")
      v-card( v-if="modalProduct!==null")
        v-card-title {{modalProduct.title}}
          v-spacer
          v-btn(rounded icon @click="showModal = false")
            v-icon mdi-close
        v-col
          v-carousel(hide-delimiters height="auto" v-model="showImage")
            v-carousel-item(v-for="(image, i) in modalProduct.image" :key="i")
              v-img.ma-3(contain :src="require(`assets/pictures/${image}`)")
        v-card-text
          v-row
            v-col(md="2" v-for="(image,i) in modalProduct.image" :key="i")
              v-img(contain :src="require(`assets/pictures/${image}`)" @click="showImage=i" )
</template>

<script>
export default {
  name: 'SeriesSlugPage',
  async asyncData({ params: { slug }, $content, route }) {
    try {
      const content = await $content('runs').where({ slug }).fetch()
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
