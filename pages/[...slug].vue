<template lang="pug">
.container
  ContentDoc( v-slot="{doc}")
    .row
      .col
        h1.text-uppercase.text-orange-400 {{doc.title}}
        ContentRenderer(:value="doc")
</template>

<script>
</script>
