<template lang="pug">
.main.flex.flex-col.justify-between.h-full.overflow-auto
  Header
  .container.mx-auto.flex-grow
    //.p-3.rounded-md.bg-gradient-to-r.from-red-500.to-orange-500.text-black.font-semibold.text-center
      | La boutique est momentanément suspendue. Les tirages reviennent bientôt
      |
      b.font-bold.text-white #stayConnect
    slot
  Footer
</template>

<script>

</script>

<style lang="stylus" scoped>
h1, h2, h3, h4, h5, h6
  font-family "Righteous"
</style>
