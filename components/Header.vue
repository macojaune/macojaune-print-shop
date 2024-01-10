<template lang="pug">
header(class="flex items-center md:justify-center py-6 md:py-32 flex-col md:flex-row")
  nav(class="md:flex-2 md:mr-auto md:grow")
    NuxtLink.text-center.text-amber-400(class="hover:text-orange-600 transition-colors ease-in-out duration-150" to="/" itemprop="brand" itemtype="http://schema.org/Organization")
      h1(v-if="route.path ==='/'" class="text-5xl/7 md:text-7xl font-display") @MACOJAUNE
        br.block(class="md:hidden")
        |
        span.text-xl.text-white(v-if="route.path.includes('blog')")  LE BLOG
        span.text-xl.text-white(v-else)  LE SITE
      h2(v-else-if="route.path !=='/shop'" class="text-5xl/7 md:text-7xl font-display") @MACOJAUNE
        br.block(class="md:hidden")
        |
        span.text-xl.text-white(v-if="route.path.includes('blog')")  LE BLOG
        span.text-xl.text-white(v-else)  LE SITE
      h1.text-3xl(v-else class="font-display text-3xl md:text-6xl" itemprop="name") YELLOW ART SHOP
        p.text-lg.text-center.text-white.font-semibold.uppercase {{route.path === '/shop' ? 'La boutique' : 'Le site'}}
  button.text-white.snipcart-checkout.flex.items-center.mt-3(class="md:mt-0 md:mx-5 hover:bg-black hover:text-amber-400 active:bg-amber-500 active:text-black rounded py-2 px-3")
    svg(viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" class="snipcart-cart-header__icon snipcart__icon")
      path(fill-rule="evenodd" clip-rule="evenodd" d="M51.714 20.47L55 60H9l3.286-39.53h9.857v-6.588C22.143 8.424 26.556 4 32 4c5.444 0 9.857 4.424 9.857 9.882v6.589h9.857zM25.43 13.883v16.47h-3.286v-6.587h-6.834l-2.737 32.94h38.856l-2.737-32.94h-6.834v6.588h-3.286v-16.47c0-3.634-2.947-6.589-6.571-6.589-3.624 0-6.571 2.955-6.571 6.588zm3.285 9.883V20.47h6.572v3.294h-6.572z" fill="white")
    span.snipcart-total-price
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

const route = useRoute()

</script>

<style lang="stylus" scoped></style>
