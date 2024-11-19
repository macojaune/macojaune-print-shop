<template>
  <section>
    <h2 class="mb-8 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
      Commande ton tirage photo
      <small class="font-sans text-base font-normal italic text-red-500">Livraison à l'international</small>
    </h2>
    <ContentList v-slot="{list}" :query="runQuery">
      <div class="mb-2 grid grid-cols-1 gap-5 lg:grid-rows-3">
        <div v-for="serie in list">
          <NuxtLink

              :key="serie.slug"
              :to="`/series/${serie.slug}`"
              class="group"
          >
            <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
              <span class="font-sans text-xl text-amber-500">Série:</span> {{
                serie.title
              }}
              <small class="text-sm font-sans" v-if="serie.date">{{ moment(serie.date).format('ll') }}</small>
            </h4>
          </NuxtLink>
            <div class="flex flex-row gap-2 justify-evenly">
              <div
                v-for="product in serie.products"
                :key="product.slug"
                class="contents">
              <NuxtLink  v-for="image in product.images.slice(0,4)"
                                  :key="image"  class="contents" :to="`/series/${serie.slug}/${product.slug}`">
                <NuxtImg
                    :src="image"
                    format="webp"
                    sizes="xs:100vw lg:25vw"
                    placeholder
                />
              </NuxtLink>
            </div>
            </div>
          <div v-if="list.length > 3" class="mt-5 flex w-full justify-center">
            <NuxtLink
                class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600"
                to="/series"
            >
              Voir toutes les séries
            </NuxtLink>
          </div>
        </div>
      </div>
    </ContentList>
  </section>
</template>
<script setup lang="ts">
import type {QueryBuilderParams} from "@nuxt/content/types";
import moment from "moment/moment";

const runQuery: QueryBuilderParams = {
  path: "/runs", limit: 3, sort:
      {date: -1}
}
</script>
