<template>
  <div class="w-full px-4">
    <h2 class="font-display uppercase text-amber-600 lg:my-3 lg:text-7xl">
      {{ data?.title ?? "" }}
    </h2>
    <div class="lg:w-7/12">
      <ContentRenderer class="text-lg text-white" :value="data" />
    </div>
    <div v-if="isProject">
      <h3 class="font-display my-2 text-2xl text-amber-400 lg:my-3 lg:text-3xl">
        Je veux participer, comment on fait
        ?
      </h3>
      <p class="text-xl text-white">
        Très simple, contacte-moi via Instagram ou Telegram <span
          class="text-sm italic text-orange-500"
        >(ou
          klaxonne
          moi dans la
          rue)</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Article } from '~/types'

const { params } = useRoute()
const { data } = await useAsyncData('get-document', () =>
  queryContent<Article>('/blog').where({ permalink: `${params?.permalink}` }).findOne())

const isProject = computed(() => !!data?.title?.startsWith('[PROJET]'))
</script>

<style scoped>
a:deep(a){
@apply text-amber-400 hover:text-amber-600 font-bold
}
</style>
