<template lang="pug">
.main.flex.flex-col.justify-between.h-full.overflow-auto
  Header
  .container.mx-auto.flex-grow
    .p-3.rounded-md.bg-gradient-to-r.from-red-500.to-orange-500.text-black.font-semibold.text-center
      | La boutique est momentanément suspendue. Les tirages reviennent bientôt
      |
      b.font-bold.text-white #stayConnect
    slot
  Footer
</template>

<script setup>
import {onMounted} from 'vue'
onMounted(()=>{
  window.axeptioSettings = {
    clientId: "62e86de9c231db01ef04b2cc",
  };
   
  (function(d, s) {
    let t = d.getElementsByTagName(s)[0], e = d.createElement(s);
    e.async = true; e.src = "//static.axept.io/sdk.js";
    t.parentNode.insertBefore(e, t);
  })(document, "script");
})
</script>

<style lang="stylus" scoped>
h1, h2, h3, h4, h5, h6
  font-family "Righteous"
</style>
