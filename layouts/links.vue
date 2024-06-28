<template lang="pug">
.main.flex.flex-col.justify-between.h-full.overflow-auto
  LinksHeader
  slot
  Footer
</template>

<script lang="ts" setup>
useHead({script:[{src:"https://analytics.marvinl.com/script.js", "data-website-id":"0b0e019d-fed5-4e0d-aa0b-01c8811b7a53", defer:true}]})

</script>

<style lang="stylus" scoped>
a
  box-shadow none
  text-decoration none

  &:hover
    color var(--v-accent-base)

h1, h2, h3, h4, h5, h6
  font-family "Righteous"

#app
  background-color: #000000;
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23f44336' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
  animation: move-background 100s linear infinite;

@keyframes move-background
  from
    background-position 0 0
  to
    background-position 1000px 1000px
</style>
