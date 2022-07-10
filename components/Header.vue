<template lang="pug">
header.py-32
  NuxtLink.text-center.main-title.text-amber-400(class="hover:text-orange-600 transition-colors ease-in-out duration-150" to="/")
    h1(v-if="$route.path==='/'") YELLOW
      br.block(class="md:hidden")
      |
      | ART SHOP
    h3(v-else) YELLOW ART SHOP
  p.text-center.text-white.font-semibold @MACOJAUNE
</template>

<script>
</script>

<style lang="stylus" scoped>
</style>
