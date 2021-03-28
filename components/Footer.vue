<template lang="pug">
  v-footer#footer
    v-container
      v-row
        v-col.text-center
          p Propulsé avec
            | !{' '}
            v-icon(color="primary") mdi-heart
            |
            | par
            |
            a(href="https://marvinl.com?ref=yellowartshop" target="_blank") MarvinL.com
      v-row.justify-center
        v-col(cols="auto")
          v-btn(href="https://facebook.com/macojaune" icon)
            v-icon(size="24px") mdi-facebook
        v-col(cols="auto")
          v-btn(href="https://twitter.com/macojaune" icon)
            v-icon(size="24px") mdi-twitter
        v-col(cols="auto")
          v-btn(href="https://instagram.com/macojaune" icon)
            v-icon(size="24px") mdi-instagram
      v-row
        v-col(md)
            v-list-item
              v-list-item-action
                nuxt-link(to="/link") Liens utiles
            v-list-item
              v-list-item-action
                nuxt-link(to="/mentions-legales") Mentions Légales
            v-list-item
              nuxt-link(to="/conditions-generales-de-vente" ) CGV
        v-col(md)
        v-col(md="4")
          a.tipeee-project-small(href="https://fr.tipeee.com/macojaune") Soutenez MacoJaune sur Tipeee
          script(async src="https://plugin.tipeee.com/widget.js" charset="utf-8")
</template>

<script>
export default {
  name: 'Footer',
}
</script>

<style lang="stylus" scoped>
#footer
  background-color rgba(0,0,0,0.7)
</style>
