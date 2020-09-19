<template lang="pug">
  v-container(justify-center align-center)
    v-row.run(v-for="(run, i) in runs" :key="i")
      v-col.run-text(cols="4")
        small.run-date {{$formatDate(run.attributes.date)}}
        h2.mb-2.run-title.text-uppercase
          nuxt-link(:to="`/series/${run.attributes.slug}`") {{run.attributes.title}}
        p.run-description {{run.attributes.description}}
      v-col
        v-row
          v-col(v-for="(product, index) in run.attributes.products" :key="index")
            v-skeleton-loader(loading type="image" height="120px" )
              v-img
</template>

<script>
import runs from '../contents/runs'

export default {
  asyncData({ route }) {
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
