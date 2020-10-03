<template lang="pug">
  v-app(dark)
    v-main
      Header
      nuxt
    Footer
    div#snipcart(hidden data-api-key="MjNjODE4YjgtMDFmMC00NzY4LTg1ZjAtNzE3NDZiMzMxNWJiNjM2NzYyNzk2OTg2NjgwMTEz")
    script(src="https://cdn.snipcart.com/themes/v3.0.21/default/snipcart.js" async)
</template>

<script>
import Header from '~/components/Header'
import Footer from '~/components/Footer'
export default {
  components: { Header, Footer },
  data() {
    return {}
  },
}
</script>

<style lang="stylus">
a
  box-shadow none
  text-decoration none
  &:hover
    color var(--v-accent-base)
header
  padding 128px 0 175px
  h1
    font-size 77px
  h3
    font-size 66px
  @media screen and (max-width: 767px)
    padding 0
    h1
      font-size 66px
    h3
      font-size 40px

h1, h2, h3, h4, h5, h6
    font-family "Righteous"
</style>
