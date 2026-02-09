<template>
    <div class="bento-page min-h-screen bg-[#0a0a0a] text-white">
        <!-- Full-width header -->
        <header class="px-6 md:px-12 pt-16 pb-8">
            <h1 class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
                <span class="text-amber-400">@</span>MACOJAUNE
            </h1>
            <p class="text-gray-400 text-base md:text-lg uppercase tracking-[0.3em]">
                Photographer · Developer · Entrepreneur
            </p>
        </header>

        <!-- Full-width bento grid -->
        <main class="px-6 md:px-12 pb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 lg:grid-flow-row gap-4">
                <!-- Storytelling - Top, replacing featured article format -->
                <section
                    class="lg:col-span-5 lg: bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 flex flex-col justify-between">
                    <div>
                        <span class="text-[#FFD700] text-xs uppercase tracking-wider">About</span>
                        <h2 class="text-3xl md:text-4xl font-bold mt-4 mb-6 leading-tight">
                            Capturer l'instant, construire l'avenir
                        </h2>
                        <p class="text-gray-400 leading-relaxed mb-4">
                            Je suis Macojaune. Photographer, développeur, entrepreneur. Un couteau suisse créatif.
                        </p>
                        <p class="text-gray-400 leading-relaxed mb-4">
                            À travers mon objectif, je capture des moments qui parlent. À travers mon code, je construis
                            des outils qui comptent.
                        </p>
                        <p class="text-gray-400 leading-relaxed">
                            Ce site est mon territoire d'expression. Un lieu où mes projets, mes pensées et mon travail
                            se retrouvent.
                        </p>
                    </div>
                    <div class="mt-8">
                        <NuxtLink to="/a-propos"
                            class="inline-block text-[#FFD700] font-bold hover:text-white transition-colors">
                            En savoir plus →
                        </NuxtLink>
                    </div>
                </section>

                <!-- Links -->
                <div class="lg:grid-cols-subgrid lg:grid lg:grid-rows-2  lg:col-span-3 lg:gap-2">
                    <div class="bg-zinc-800 rounded-3xl p-6 flex flex-col justify-center">
                        <h2 class="text-sm font-bold mb-3 text-gray-500 uppercase tracking-wider">Réseaux</h2>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-3xl p-6 flex flex-col justify-center  hover:bg-[#FFD700] group transition-colors">
                        <a href="https://instagram.com" target="_blank"
                            class=" text-xs  px-3 py-1  group-hover:text-black transition-colors">Instagram</a>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-3xl p-6 flex flex-col justify-center  hover:bg-[#FFD700] group transition-colors">
                        <a href="https://youtube.com" target="_blank"
                            class="text-xs group-hover:text-black transition-colors">YouTube</a>
                    </div>
                    <div
                        class="lg:col-start-2 bg-zinc-800 rounded-3xl p-6 flex flex-col justify-center  hover:bg-[#FFD700] group transition-colors">
                        <a href="https://linkedin.com" target="_blank"
                            class="text-xs group-hover:text-black transition-colors">LinkedIn</a>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-3xl p-6 flex flex-col justify-center  hover:bg-[#FFD700] group transition-colors">
                        <a href="https://github.com" target="_blank"
                            class="text-xs group-hover:text-black transition-colors">GitHub</a>
                    </div>
                </div>

                <!-- Featured Article -->
                <ContentList v-slot="{ list }" :query="articleQuery" :limit="1">
                    <article v-for="article in list" :key="article.permalink"
                        class="lg:col-span-4 bg-zinc-800 rounded-3xl overflow-hidden group cursor-pointer relative">
                        <div class="aspect-[16/10] relative overflow-hidden">
                            <img v-if="article.image" :src="article.image" :alt="article.title"
                                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div v-else class="w-full h-full bg-zinc-700 flex items-center justify-center">
                                <span class="text-6xl font-black text-amber-400">macojaune</span>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 p-6">
                                <span class="text-[#FFD700] text-xs uppercase tracking-wider">Latest Article</span>
                                <h2 class="text-2xl md:text-3xl mt-2 font-bold leading-tight">{{ article.title }}
                                </h2>
                            </div>
                        </div>
                        <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
                    </article>
                </ContentList>

                <div class="grid lg:grid-cols-2 lg:grid-rows-2 lg:grid-flow-row-dense lg:col-span-4 gap-4">
                    <!-- Section Title: Blog -->
                    <div class=" bg-zinc-900/30 rounded-2xl p-4 flex items-center justify-center">
                        <h2 class="text-xl font-black text-white uppercase tracking-widest text-center">Blog</h2>
                    </div>
                    <!-- Recent Articles -->
                    <ContentList v-slot="{ list }" :query="recentArticlesQuery" :limit="3">
                        <article v-for="(article, idx) in list" :key="article.permalink"
                            class=" bg-zinc-800 rounded-3xl p-6 group cursor-pointer hover:bg-zinc-700 transition-colors">
                            <span class="text-gray-600 text-xs uppercase">Article {{ idx + 2 }}</span>
                            <h3 class="text-lg font-bold mt-2 group-hover:text-[#FFD700] transition-colors">{{
                                article.title
                                }}</h3>
                            <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ article.description }}</p>
                            <NuxtLink :to="`/blog/${article.permalink}`"
                                class="inline-block mt-3 text-[#FFD700] text-sm">
                                Read →
                            </NuxtLink>
                        </article>
                    </ContentList>
                </div>

                <!-- ==================== BOUTIQUE ==================== -->
                <!-- Boutique Title -->
                <div class="bg-zinc-800/50 rounded-2xl p-4 flex items-center justify-center">
                    <h2 class="text-xl font-black text-white uppercase tracking-widest text-center">Boutique</h2>
                </div>

                <!-- Boutique Products - From runs -->
                <ContentList v-slot="{ list }" :query="runsQuery" :limit="2">
                    <template v-for="run in list" :key="run._path">
                        <!-- Serie Header -->
                        <div class="lg:col-span-8 bg-zinc-900/30 rounded-2xl px-6 py-3 border border-zinc-800 flex items-center justify-between">
                            <h3 class="text-lg font-bold">{{ run.title }}</h3>
                            <span class="text-xs text-gray-500">{{ run.products?.length || 0 }} tirages</span>
                        </div>
                        
                        <!-- Products Grid -->
                        <div class="lg:col-span-8 bg-zinc-900/30 rounded-3xl p-6 border border-zinc-800">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <article v-for="(product, idx) in run.products?.slice(0, 4)" :key="product.sku"
                                    :class="['bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer relative', idx === 3 ? 'md:col-span-2' : '']">
                                    <div :class="['relative overflow-hidden', idx === 3 ? 'aspect-[16/10]' : 'aspect-[3/4]']">
                                        <img v-if="product.images && product.images[0]" :src="product.images[0]" :alt="product.title"
                                            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div v-else class="absolute inset-0 bg-zinc-700 flex items-center justify-center">
                                            <span class="text-2xl font-bold text-[#FFD700]">{{ product.title }}</span>
                                        </div>
                                        <!-- Hover overlay that fades -->
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                                        </div>
                                        <div class="absolute bottom-0 left-0 right-0 p-4 translate-y-0 group-hover:translate-y-full group-hover:opacity-0 transition-all duration-300">
                                            <span class="text-[#FFD700] font-bold block">{{ product.price }}€</span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </template>
                </ContentList>

                <!-- Boutique Link -->
                <div class="lg:col-span-8 bg-zinc-800 rounded-xl p-4 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                    <NuxtLink to="/shop" class="text-[#FFD700] font-bold uppercase tracking-wider hover:text-white transition-colors">
                        Voir toute la boutique →
                    </NuxtLink>
                </div>

                <!-- ==================== PROJECTS ==================== -->
                <!-- Projects Title -->
                <div class="bg-zinc-800/50 rounded-2xl p-4 flex items-center justify-center">
                    <h2 class="text-xl font-black text-white uppercase tracking-widest text-center">Projects</h2>
                </div>

                <!-- Projects Grid -->
                <div class="lg:col-span-7 bg-zinc-900/30 rounded-3xl p-6 border border-zinc-800">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <!-- Project 1 -->
                        <ContentList v-slot="{ list }" :query="projectQuery" :limit="6">
                            <article v-for="(project, idx) in list" :key="project.permalink"
                                class="bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer relative">
                                <div class="aspect-[4/3] relative overflow-hidden">
                                    <img v-if="project.image" :src="project.image" :alt="project.title"
                                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div v-else class="w-full h-full bg-zinc-700 flex items-center justify-center">
                                        <span class="text-2xl font-bold text-[#FFD700]">MJ</span>
                                    </div>
                                    <div
                                        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                    </div>
                                    <div class="absolute bottom-0 left-0 right-0 p-3">
                                        <h3 class="text-sm font-bold truncate group-hover:text-[#FFD700] transition-colors">
                                            {{ project.title }}</h3>
                                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ project.description }}</p>
                                    </div>
                                </div>
                                <NuxtLink :to="`/projets/${project.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
                            </article>
                        </ContentList>
                    </div>
                </div>

                <!-- ==================== VIDEO + STATS ==================== -->
                <!-- Video - Vertical -->
                <div class="lg:col-span-1 lg:row-span-2 bg-zinc-800 rounded-3xl overflow-hidden">
                    <div class="aspect-[9/16] max-h-full relative">
                        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Latest Video"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen class="absolute inset-0 w-full h-full"></iframe>
                    </div>
                </div>

                <!-- Stats -->
                <div class="lg:col-span-7 bg-zinc-800 rounded-3xl p-6">
                    <h2 class="text-sm font-bold mb-4 text-gray-500 uppercase tracking-wider">Stats</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Articles</span>
                            <span class="text-[#FFD700] font-bold">50+</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Prints</span>
                            <span class="text-[#FFD700] font-bold">12</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Projects</span>
                            <span class="text-[#FFD700] font-bold">4</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Years</span>
                            <span class="text-[#FFD700] font-bold">2020+</span>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        <footer class="border-t border-zinc-800 px-6 md:px-12 py-8">
            <p class="text-gray-600 text-xs text-center">MACOJAUNE.COM /// BENTO EDITION</p>
        </footer>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

import type { QueryBuilderParams } from '@nuxt/content/types'

const articleQuery: QueryBuilderParams = {
    path: '/blog',
    where: [{ draft: false }],
    sort: [{ date: -1 }]
}

const recentArticlesQuery: QueryBuilderParams = {
    path: '/blog',
    where: [{ draft: false }],
    sort: [{ date: -1 }],
    skip: 1,
    limit: 2
}

const projectQuery: QueryBuilderParams = {
    path: '/projects',
    where: [{ draft: false }],
    sort: [{ date: -1 }]
}

const runsQuery: QueryBuilderParams = {
    path: '/runs',
    sort: [{ date: -1 }]
}

useHead({
    title: 'Macojaune - Bento Grid',
    meta: [{ name: 'description', content: 'Portfolio de Macojaune - Style Bento Grid' }],
    link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap' }
    ]
})
</script>
