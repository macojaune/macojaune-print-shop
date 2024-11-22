<template>
    <div class="serie-page px-4">
        <ContentRenderer :value="serie">
            <div class="content">
                <h1 class="mt-6 mb-3 text-5xl uppercase text-amber-500 font-display">
                    {{ serie.title }}
                    <small class="font-sans text-sm text-white">{{ formatDate(serie.date) }}</small>
                </h1>

                <ContentRendererMarkdown :value="serie" class="text-white text-base md:text-lg" />

                <div class="picture-list my-6 grid grid-flow-row-dense gap-4 justify-evenly items-end"
                    :class="`grid-cols-1 ${serie.products.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`">
                    <div v-for="(product, index) in serie.products" :key="index" class="picture">
                        <NuxtLink :to="product.slug">
                            <NuxtImg v-if="product.images" class="primary border-radius mb-2" :src="`${product.images[0]}`"
                                sizes="xs:100vw lg:500px" format="webp" quality="60" itemprop="image"
                                :alt="product.title" />

                            <p v-if="product.price" class="text-2xl text-center text-amber-400 font-semibold">
                                {{ product.price }}€
                                <Meta itemprop="price" :content="product.price" />
                                <Meta itemprop="priceCurrency" content="EUR" />
                            </p>

                            <p class="mt-2 text-2xl text-center text-white font-display" itemprop="name">
                                {{ product.title }}
                                <br>
                                <span v-if="product.stock > 0"
                                    class="font-sans text-base text-caption text-decoration-line-through"
                                    itemprop="availability" href="http://schema.org/InStock">
                                    Édition limitée à {{ product.stock }} exemplaires
                                </span>
                                <span v-else class="font-bold text-red-500" itemprop="availability"
                                    href="http://schema.org/OutOfStock">
                                    Épuisé
                                </span>
                            </p>
                        </NuxtLink>

                        <div v-if="product.stock > 0 && product.price" class="flex justify-center pt-4">
                            <BuyButton :product="product" />
                        </div>
                    </div>
                </div>
            </div>
        </ContentRenderer>
    </div>
</template>

<script lang="ts" setup>
import moment from 'moment'
moment.locale('fr')

const router = useRoute()

definePageMeta({
    layout: 'default'
})
const serie = await queryContent('runs').where({ slug: router.params.slug }).findOne()
const title = 'Série photo ' + serie.title + ' - Macojaune.com'
useHead({
    title,
    meta: [
        {
            name: 'title',
            content: title
        },
        {
            name: 'description',
            content: serie.description
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `https://macojaune.com${router.path}` },
        { property: 'og:title', content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: 'og:description',
            content: serie.description
        },
        { property: 'og:image', content: `https://macojaune.com/pictures/${serie?.products?.[0].images?.[0]}` },
        {
            property: 'twitter:card', content: 'summary_large_image'
        },
        { property: 'twitter:url', content: `https://macojaune.com${router.path}` },
        { property: 'twitter:title', content: `Découvre la série ${serie.title} sur le site de @macojaune` },
        {
            property: 'twitter:description',
            content: serie.description
        },
        { property: 'twitter:image', content: `https://macojaune.com/pictures/${serie?.products?.[0].images?.[0]}` }
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'http://schema.org/',
                '@type': 'BreadcrumbList',

                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        item: {
                            '@id': 'https://macojaune.com',
                            name: 'Homepage'
                        }
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        item: {
                            '@id': 'https://macojaune.com' + router.fullPath,
                            name: serie.title
                        }
                    }
                ]
            })
        }
    ]
})

const formatDate = (date: string) => moment(date).format('ll')

</script>
