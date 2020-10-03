<template lang="pug">
  v-container
    v-row
      v-col(cols=12)
        header
          nuxt-link(to="/")
            h1.text-center.main-title(v-if="$nuxt.$route.name==='index'") YELLOW
              br.d-block.d-md-none
              |
              | ART SHOP
            h3.text-center.main-title(v-else) YELLOW ART SHOP
          p.text-center @MACOJAUNE
</template>

<script>
export default {
  name: 'Header',
}
</script>

<style lang="stylus" scoped></style>
