<template lang="pug">
header(class="py-6 md:py-32")
  NuxtLink.text-center.text-amber-400(class="hover:text-orange-600 transition-colors ease-in-out duration-150" to="/")
    h1(v-if="route.path==='/'" class="text-5xl md:text-7xl") YELLOW
      br.block(class="md:hidden")
      |
      | ART SHOP
    h3(v-else class="text-3xl md:text-6xl") YELLOW ART SHOP
  p.text-center.text-white.font-semibold @MACOJAUNE
</template>

<script setup>
const route = useRoute()
</script>

<style lang="stylus" scoped>
</style>
