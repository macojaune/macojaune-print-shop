<template lang="pug">
.serie-page.px-4
    ContentRenderer(:value="serie")
        NuxtLink(to="./")
            p.mt-6.mb-3.text-2xl.uppercase.text-amber-400.font-display &lt; {{serie.title}}
        h1.mt-6.mb-3.text-5xl.uppercase.text-amber-500.font-display(itemprop="name") {{product.title}} 
            br
            small.font-sans.text-sm.text-white.normal-case
                span.text-caption.text-decoration-line-through(v-if="product.stock>0" itemprop="availability" href="http://schema.org/InStock") Édition limitée à {{product.stock}} exemplaires
                span.font-bold.text-red-500(v-else itemprop="availability" href="http://schema.org/OutOfStock") Épuisé
        p.text-white.text-lg(class="text-base md:text-lg")
            ContentSlot(:use="$slots.default") {{ product.description }}
        .flex.flex-col.justify-end.pt-4.gap-4.items-center(v-if="product.stock>0&&product.price")
            p.text-2xl.text-center.text-amber-400.font-semibold(v-if="product.price") {{product.price}}€
                Meta(itemprop="price" :content="product.price")
                Meta(itemprop="priceCurrency" content="EUR")
            button.snipcart-add-item.px-8.py-2.rounded.bg-yellow-400.text-black.font-bold(
                class="hover:bg-amber-400 active:bg-amber-500"
                :data-item-id="product.sku"
                :data-item-name="product.title"
                :data-item-price="product.price"
                :data-item-image="`/pictures/${product.images[0]}`"
                :data-item-max-quantity="product.stock"
                :data-item-url="`https://macojaune.com${router.path}/${product.slug}`" ) Ajouter au panier
        .picture-list.my-6.grid.grid-flow-row-dense.gap-4.justify-around.items-end(:class="`grid-cols-1 ${product.images.length>2?'md:grid-cols-3':'md:grid-cols-2'}`")
            .picture(v-for="(imageURL, index) in product.images" :key="index" class="hover:cursor-pointer")
                img.primary.border-radius.mb-2(:src="`/pictures${imageURL}`" fit="cover" itemprop="image" :alt="product.title")
</template>

<script lang="ts" setup>
const router = useRoute();
definePageMeta({
    layout: "default",
});
const serie = await queryContent("runs").where({ slug: router.params.slug }).findOne();
const product = serie.products.find(
    (p: { slug: string | string[]; }) => p.slug === router.params.productSlug
);
useHead({
    //   title: product.title + " - Macojaune.com",
    script: [
        {
            type: "application/ld+json",
            children: JSON.stringify({
                "@context": "http://schema.org/",
                "@type": "BreadcrumbList",

                itemListElement: [
                    {
                        "@type": "ListItem",
                        position: 1,
                        item: {
                            "@id": "https://macojaune.com",
                            name: "Homepage",
                        },
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        item: {
                            "@id": "https://macojaune.com/series/" + router.params.slug,
                            name: router.params.slug,
                        },
                    },
                    {
                        "@type": "ListItem",
                        position: 3,
                        item: {
                            "@id": "https://macojaune.com" + router.fullPath,
                            name: router.params.productSlug,
                        },
                    },
                ],
            }),
        },
    ],
});
</script>

<style lang="stylus" scoped>
p a 
 color var(--tw-yellow-500)
</style>