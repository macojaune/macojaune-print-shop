<template>
  <div class="w-full px-4">
    <h2 class="font-display uppercase text-amber-600 lg:my-3 lg:text-7xl">
      {{ data?.title ?? "" }}
    </h2>
    <div class="  lg:w-7/12 ">
      <ContentRenderer class="text-lg text-white" :value="data" />
    </div>
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
