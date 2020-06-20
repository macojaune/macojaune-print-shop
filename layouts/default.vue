<template lang="pug">
  v-app(dark)
    v-main
      nuxt
    v-footer(app)
      p Propulsé avec 💛  par
        a(href="https://marvinl.com") MarvinL.com
    div#snipcart(hidden data-api-key="MjNjODE4YjgtMDFmMC00NzY4LTg1ZjAtNzE3NDZiMzMxNWJiNjM2NzYyNzk2OTg2NjgwMTEz")
    script(src="https://cdn.snipcart.com/themes/v3.0.15/default/snipcart.js")
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>
