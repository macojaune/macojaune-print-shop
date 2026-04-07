<template>
    <header
        :class="[
            'flex flex-col md:flex-row',
            isCompactHeader
                ? 'py-4 md:py-10 items-center md:justify-center'
                : 'py-6 md:py-20 items-center md:justify-center',
        ]"
    >
        <nav class="md:flex-2 md:mr-auto md:grow">
            <NuxtLink
                class="text-center text-amber-400 hover:text-orange-600 transition-colors ease-in-out duration-150"
                to="/" itemprop="brand" itemtype="http://schema.org/Organization">
                <h2 v-if="route.path === '/'" class="text-5xl/7 md:text-7xl font-display">
                    @MACOJAUNE<br class="block md:hidden"><span v-if="route.path.includes('blog')" class="text-xl text-white">
                        LE BLOG</span><span v-else class="text-xl text-white"> LE SITE</span>
                </h2>
                <h2
                    v-else-if="!isGalleryRoute"
                    :class="[isCompactHeader ? 'text-5xl/7 md:text-7xl font-display' : 'text-5xl/7 md:text-7xl font-display']"
                >
                    @MACOJAUNE
                    <br :class="[isCompactHeader ? 'block md:hidden' : 'block md:hidden']">
                    <span v-if="route.path.includes('blog')" class="text-xl text-white">
                        LE BLOG</span>
                    <span v-else :class="[isCompactHeader ? 'text-xl' : 'text-xl', 'text-white']"> LE SITE</span>
                </h2>
                <h2 v-else class="text-3xl font-display md:text-6xl" itemprop="name">
                    YELLOW ART GALLERY
                    <br>
                    <span class="text-white text-lg lg:text-xl"> @MACOJAUNE</span>
                </h2>
            </NuxtLink>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();
const isGalleryRoute = computed(() =>
    route.path === "/galerie" || route.path === "/shop" || route.path.startsWith("/series/"))
const isCompactHeader = computed(() =>
    props.isSmall || route.path === "/projets" || route.path.startsWith("/projets/"))
const props = withDefaults(defineProps<{
    isSmall?: boolean;
}>(), {
    isSmall: false
})
</script>
