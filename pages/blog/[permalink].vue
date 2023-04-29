<template>
  <div>
    <h2 class="font-display my-3 text-5xl uppercase text-amber-600">
      {{ data?.title ?? "" }}
    </h2>
    <ContentRenderer class="text-lg text-white" :value="data" />
  </div>
</template>

<script setup lang="ts">
const { params } = useRoute()
const { data } = await useAsyncData('get-document', () =>
  queryContent('/blog').where({ permalink: `${params?.permalink}` }).findOne())
</script>

<style scoped>
a:deep(a){
@apply text-amber-400 hover:text-amber-600 font-bold
}
</style>
