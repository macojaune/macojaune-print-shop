<template>
    <header
        class="flex items-center md:justify-center py-6 md:py-20 flex-col md:flex-row"
    >
        <nav class="md:flex-2 md:mr-auto md:grow">
            <NuxtLink
                class="text-center text-amber-400 hover:text-orange-600 transition-colors ease-in-out duration-150"
                to="/"
                itemprop="brand"
                itemtype="http://schema.org/Organization"
            >
                <h1
                    class="text-5xl/7 md:text-7xl font-display"
                    v-if="route.path === '/'"
                >
                    @MACOJAUNE<br class="block md:hidden" /><span
                        class="text-xl text-white"
                        v-if="route.path.includes('blog')"
                    >
                        LE BLOG</span
                    ><span class="text-xl text-white" v-else> LE SITE</span>
                </h1>
                <h2
                    class="text-5xl/7 md:text-7xl font-display"
                    v-else-if="route.path !== '/shop'"
                >
                    @MACOJAUNE<br class="block md:hidden" /><span
                        class="text-xl text-white"
                        v-if="route.path.includes('blog')"
                    >
                        LE BLOG</span
                    ><span class="text-xl text-white" v-else> LE SITE</span>
                </h2>
                <h1
                    class="text-3xl font-display text-3xl md:text-6xl"
                    v-else
                    itemprop="name"
                >
                    YELLOW ART SHOP
                    <p
                        class="text-lg text-center text-white font-semibold uppercase"
                    >
                        {{ route.path === "/shop" ? "La boutique" : "Le site" }}
                    </p>
                </h1>
            </NuxtLink>
        </nav>
    </header>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<style lang="stylus" scoped></style>
