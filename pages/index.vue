<template lang="pug">
  v-container(justify-center align-center)
    v-row
      v-col
        h1 Macojaune vente de photos
        p.text-center BLALBALBALB
    v-row(v-for="(run, i) in runs" :key="i")
      v-col(cols="4")
        h2
          small {{run.attributes.date}}
          br
          nuxt-link(:to="`/series/${run.attributes.slug}`") {{run.attributes.title}}
        p {{run.attributes.description}}
      v-col
        v-row
          v-col(v-for="(product, index) in run.attributes.products" :key="index")
            v-skeleton-loader(loading type="image" height="120px" )
              v-img
            p.my-2 {{product.title}}
              v-btn(text small) 2/3 restants
</template>

<script>
import runs from '../contents/runs'

export default {
  asyncData({ route }) {
    return { runs }
  },
}
</script>
