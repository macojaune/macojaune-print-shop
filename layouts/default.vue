<template lang="pug">
.main.flex.flex-col.justify-between.h-full.w-full.overflow-auto
  Header
  .container.mx-auto
    //- .p-3.rounded-md.bg-gradient-to-r.from-red-500.to-orange-500.text-black.font-semibold.text-center
      | La boutique est momentanément suspendue. Les tirages reviennent bientôt
      |
      b.font-bold.text-white #stayConnect
    slot
    #snipcart(hidden :data-api-key="cPublic.snipcartKey")
  Footer
</template>

<script setup>
import { onMounted } from 'vue'
const { public: cPublic } = useRuntimeConfig()
useHead({script:[{src:"https://analytics.marvinl.com/script.js", "data-website-id":"e5e9b232-675e-4172-b463-32c56e9dc567", defer:true}]})
onMounted(() => {
  window.axeptioSettings = {
    clientId: '62e86de9c231db01ef04b2cc'
  };

  (function (d, s) {
    const t = d.getElementsByTagName(s)[0]
    const e = d.createElement(s)
    e.async = true
    e.src = '//static.axept.io/sdk.js'
    t.parentNode.insertBefore(e, t)
  })(document, 'script')
})
</script>
