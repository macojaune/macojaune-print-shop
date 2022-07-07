<template lang="pug">
  v-container
    v-row
      v-col
        h1.text-uppercase {{content.title}}
        nuxt-content(:document="content")
</template>

<script>
export default {
  name: 'Mentions',
  async asyncData({ params, $content }) {
    try {
      const data = await $content('mentions', params.slug).fetch()

      return { content: data }
    } catch (e) {
      console.error(e)
    }
  },
  head: {
    // title: this.content.title,
  },
}
</script>

<style lang="stylus" scoped>
h1
  color var(--v-secondary-base)
</style>
