<template lang="pug">
  v-container(justify-center align-center)
    .runs(v-if="runs.length>0")
      v-row.run.mt-2(v-for="(run, i) in runs" :key="i")
        v-col.run-text(cols="12" md="4" order="2" order-md="1")
          small.run-date {{$formatDate(run.date)}}
          h2.mb-2.run-title.text-uppercase
            nuxt-link(:to="`/series/${run.slug}`") {{run.title}}
          p.run-description {{run.description}}
        v-col(cols="12" md="6" order="1" offset-md="2")
          v-row.align-center.px-2
            v-col(cols="4" v-for="(product, index) in run.products.slice(0,3)" :key="index")
              nuxt-link(:to="`/series/${run.slug}`")
                v-img( v-if="product.images.length>0" :src="`/pictures${product.images[0]}?nf_resize=fit&w=400`")
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
  head: {
    title: 'Homepage',
  },
}
</script>

<style lang="stylus" scoped>
.run
  &-title
    font-family 'Righteous'
    font-size 66px
    line-height 88%
    @media screen and (max-width: 767px)
      font-size 45px
</style>
