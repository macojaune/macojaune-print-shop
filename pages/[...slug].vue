<template lang="pug">
.container
  ContentDoc(:path="`/mentions/${$route.params.slug}`" v-slot="{doc}")
    .row
      .col
        h1.my-3.text-4xl.uppercase.text-orange-400 {{doc.title}}
        ContentRenderer.text-white(:value="doc")
</template>

<script>
</script>
