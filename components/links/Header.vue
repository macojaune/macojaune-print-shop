<template lang="pug">
  v-container
    v-row
      v-col(cols=12)
        header
          nuxt-link(to="/")
            h1.text-center.main-title() MACOJAUNE
          p.text-center T'as cliqué sur le lien dans ma bio ? Tu fais partie de l'élite.
</template>

<script>
export default {
  name: 'Header',
}
</script>

<style lang="stylus" scoped></style>
