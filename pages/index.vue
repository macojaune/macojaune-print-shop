<template lang="pug">
  v-container(justify-center align-center)
    .runs(v-if="runs.length>0")
      v-row.run(v-for="(run, i) in runs" :key="i")
        v-col.run-text(md="4")
          small.run-date {{$formatDate(run.date)}}
          h2.mb-2.run-title.text-uppercase
            nuxt-link(:to="`/series/${run.slug}`") {{run.title}}
          p.run-description {{run.description}}
        v-col(md="6")
          v-row
            v-col(:cols="Math.floor(12/run.products.length)" v-for="(product, index) in run.products" :key="index")
              nuxt-link(:to="`/series/${run.slug}`")
                v-img( v-if="product.images.length>0" :src="require(`~/assets/pictures${product.images[0]}`)")
                v-avatar.white--text(v-else color="primary" tile size="100%" ) {{product.title}}
    .empty(v-else)
      v-row
        v-col
          h3.text-center.warning--text Oups ! Pas de série disponible à la vente.
</template>

<script>
export default {
  async asyncData({ $content }) {
    const runs = await $content('runs').sortBy('date', 'desc').fetch()
    return { runs }
  },
}
</script>

<style lang="stylus" scoped>
.run
  &-title
    font-family 'Righteous'
    font-size 66px
    line-height 88%
</style>
