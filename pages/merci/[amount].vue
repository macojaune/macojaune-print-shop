<template lang="pug">
.merci.mt-8.container.mx-auto
  h1.text-8xl.text-white.text-center.text-amber-500.uppercase Merci
  p.text-white.text-center.mb-8 Il y a exactement 
    span.text-orange-400.text-3xl.font-bold {{amount}}
    |  mercis sur cette page.
  .flex.flex-wrap.gap-2.items-evenly
    span.p-4.text-white.animate-bounce(v-for="i in amount" class="cursor-default hover:cursor-default hover:text-amber-500 transition-colors delay-500") merci
  p.text-center.font-bold.text-orange-400 T'es vraiment en train de les compter là ? 😐😐
</template>

<script setup>
const route = useRoute()
const amount = parseInt(route.params?.amount || "1000",10)
</script>

<style scoped>

</style>
