<template lang="pug">
  v-footer(app)
    v-row
      v-col.text-center
        p Propulsé avec
          |
          v-icon(color="primary") mdi-heart
          |
          | par
          |
          a(href="https://marvinl.com?ref=yellowartshop" target="_blank") MarvinL.com
    v-row
      v-col(md)
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

<style scoped></style>
