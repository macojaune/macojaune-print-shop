<template lang="pug">
  header
    nuxt-link(to="/")
      h1.text-center.main-title(v-if="$nuxt.$route.name==='index'") YELLOW ART SHOP
      h3.text-center(v-else) YELLOW ART SHOP
    p.text-center @MACOJAUNE
</template>

<script>
export default {
  name: 'Header',
}
</script>

<style scoped></style>
