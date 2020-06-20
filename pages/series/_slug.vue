<template lang="pug">
  v-container.serie
    v-row
      v-col
        h1
          small.text-caption {{data.date}}
          br
          | {{data.title}}
        p {{data.description}}
    v-row
      v-col(cols="12" md="4" v-for="(product, index) in data.products" :key="index")
        v-card
          v-skeleton-loader(loading type="image" tile)
            v-img
          v-card-title {{product.title}}
          v-card-actions
            v-btn.buy-button.snipcart-add-item(light :data-item-id="product.sku"
              :data-item-name="product.title"
              :data-item-price="product.price"
              :data-item-image="product.image"
              :data-item-max-quantity="product.stock"
              :data-item-url="`https://kind-noether-a52a72.netlify.app/${currentUrl}`")  J'en veux
</template>

<script>
export default {
  name: 'Slug',
  async asyncData({ params: { slug }, route }) {
    const content = await import(`~/contents/runs/${slug}.md`)
    return {
      data: content.attributes,
      html: content.html,
      currentUrl: route.path,
    }
  },
}
</script>

<style scoped></style>
