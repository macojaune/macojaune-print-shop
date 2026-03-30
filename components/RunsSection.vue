<template>
    <section>
        <h2 class="mb-8 leading-10 font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
            Commande ton tirage photo
            <small class="font-sans text-base font-normal italic text-red-500">Livraison à l'international</small>
        </h2>
        <div class="mb-2 flex flex-col gap-5">
            <div v-for="serie in runs" :key="serie.slug">
                <NuxtLink :to="`/series/${serie.slug}`" class="group">
                    <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
                        <span class="font-sans text-xl text-amber-500">Série:</span> {{
                            serie.title
                        }}
                        <small v-if="serie.date" class="text-sm font-sans">{{ moment(serie.date).format('ll') }}</small>
                    </h4>
                </NuxtLink>
                <div class="flex flex-col lg:flex-row gap-4 lg:justify-between">
                    <div class="flex flex-col w-full lg:w-2/3">
                        <p class="font-sans ">{{ serie.description }}</p>
                        <span v-if="isOutOfStock(serie)" class="font-sans text-sm text-red-500 font-bold ">Série
                            Épuisée</span>
                    </div>
                    <div
                        v-for="product in serie.products"
                        :key="product.slug"
                        class="flex flex-row lg:w-1/3 gap-2 lg:gap-1">
                        <NuxtLink
                            v-for="image in getProductImages(product).slice(0, 4)"
                            :key="image"
                            :to="`/series/${serie.slug}/${product.slug}`">
                            <RunImage :src="image" :alt="product.title" variant="thumb" sizes="25vw" />
                        </NuxtLink>
                    </div>
                </div>
            </div>
            <div class="mt-8 flex w-full justify-center">
                <NuxtLink class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600" to="/shop">
                    Voir toutes les séries
                </NuxtLink>
            </div>
        </div>
    </section>
</template>
<script setup lang="ts">
import moment from "moment/moment";
import { getRunEntries } from '~/composables/useContentCollections'
import { getProductImages } from "../utils/runs";

const runs = (await getRunEntries()).slice(0, 3)
const isOutOfStock = (serie: { products: { stock: string }[] }) => {
    return serie.products.some(product => product.stock === "0")
}
</script>
