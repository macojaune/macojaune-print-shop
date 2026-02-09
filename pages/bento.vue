<template>
    <div class="bento-page min-h-screen bg-[#0a0a0a] text-white">
        <!-- Full-width header -->
        <header class="px-4 sm:px-6 md:px-12 pt-12 sm:pt-16 pb-8">
            <h1 class="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
                <span class="text-amber-400">@</span>MACOJAUNE
            </h1>
            <p class="text-gray-400 text-xs sm:text-base md:text-lg uppercase tracking-[0.3em]">
                Photographer · Developer · Entrepreneur
            </p>
        </header>

        <!-- Full-width bento grid -->
        <main class="px-4 sm:px-6 md:px-12 pb-12">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-3 sm:gap-4">
                <!-- Storytelling -->
                <section
                    class="col-span-1 sm:col-span-2 lg:col-span-5 bg-zinc-900/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-zinc-800 flex flex-col justify-between">
                    <div>
                        <span class="text-[#FFD700] text-xs uppercase tracking-wider">About</span>
                        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold mt-4 mb-4 sm:mb-6 leading-tight">
                            Capturer l'instant, construire l'avenir
                        </h2>
                        <p class="text-gray-400 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                            Je suis Macojaune. Photographer, développeur, entrepreneur. Un couteau suisse créatif.
                        </p>
                        <p class="text-gray-400 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                            À travers mon objectif, je capture des moments qui parlent. À travers mon code, je construis
                            des outils qui comptent.
                        </p>
                        <p class="text-gray-400 leading-relaxed text-sm sm:text-base">
                            Ce site est mon territoire d'expression.
                        </p>
                    </div>
                    <div class="mt-6 sm:mt-8">
                        <NuxtLink to="/a-propos"
                            class="inline-block text-[#FFD700] font-bold hover:text-white transition-colors text-sm sm:text-base">
                            En savoir plus →
                        </NuxtLink>
                    </div>
                </section>

                <!-- Links -->
                <div class="col-span-1 sm:col-span-2 grid grid-cols-2 sm:grid-rows-2 lg:grid-rows-2 lg:col-span-3 gap-3 sm:gap-4">
                    <div class="bg-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-center">
                        <h2 class="text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-gray-500 uppercase tracking-wider">Réseaux</h2>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-center hover:bg-[#FFD700] group transition-colors">
                        <a href="https://instagram.com" target="_blank"
                            class="text-xs sm:text-sm px-2 sm:px-3 py-1 group-hover:text-black transition-colors">Instagram</a>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-center hover:bg-[#FFD700] group transition-colors">
                        <a href="https://youtube.com" target="_blank"
                            class="text-xs sm:text-sm group-hover:text-black transition-colors">YouTube</a>
                    </div>
                    <div
                        class="bg-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-center hover:bg-[#FFD700] group transition-colors">
                        <a href="https://linkedin.com" target="_blank"
                            class="text-xs sm:text-sm group-hover:text-black transition-colors">LinkedIn</a>
                    </div>
                    <div
                        class="col-span-2 sm:col-span-1 lg:col-span-1 bg-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-center hover:bg-[#FFD700] group transition-colors">
                        <a href="https://github.com" target="_blank"
                            class="text-xs sm:text-sm group-hover:text-black transition-colors">GitHub</a>
                    </div>
                </div>

                <!-- Featured Article -->
                <ContentList v-slot="{ list }" :query="articleQuery" :limit="1">
                    <article v-for="article in list" :key="article.permalink"
                        class="col-span-1 sm:col-span-2 lg:col-span-4 bg-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer relative">
                        <div class="aspect-[4/3] sm:aspect-[16/10] relative overflow-hidden">
                            <img v-if="article.image" :src="article.image" :alt="article.title"
                                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div v-else class="w-full h-full bg-zinc-700 flex items-center justify-center">
                                <span class="text-4xl sm:text-6xl font-black text-amber-400">macojaune</span>
                            </div>
                            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                                <span class="text-[#FFD700] text-xs uppercase tracking-wider">Latest Article</span>
                                <h2 class="text-xl sm:text-2xl md:text-3xl mt-2 font-bold leading-tight">{{ article.title }}
                                </h2>
                            </div>
                        </div>
                        <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
                    </article>
                </ContentList>

                <!-- Blog Section -->
                <div class="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
                    <!-- Blog Title -->
                    <div class="col-span-1 sm:col-span-2 lg:col-span-1 bg-zinc-900/30 rounded-xl sm:rounded-2xl p-4 flex items-center justify-center">
                        <h2 class="text-lg sm:text-xl font-black text-white uppercase tracking-widest text-center">Blog</h2>
                    </div>
                    <!-- Blog Articles -->
                    <ContentList v-slot="{ list }" :query="recentArticlesQuery" :limit="3">
                        <article v-for="(article, idx) in list" :key="article.permalink"
                            class="col-span-1 bg-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 group cursor-pointer hover:bg-zinc-700 transition-colors">
                            <span class="text-gray-600 text-xs uppercase">Article {{ idx + 2 }}</span>
                            <h3 class="text-sm sm:text-lg font-bold mt-2 group-hover:text-[#FFD700] transition-colors">
                                {{ article.title }}
                            </h3>
                            <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ article.description }}</p>
                            <NuxtLink :to="`/blog/${article.permalink}`"
                                class="inline-block mt-3 text-[#FFD700] text-xs sm:text-sm">
                                Read →
                            </NuxtLink>
                        </article>
                    </ContentList>
                </div>

                <!-- ==================== BOUTIQUE ==================== -->
                <!-- Boutique Title -->
                <div class="col-span-1 sm:col-span-2 lg:col-span-3 bg-zinc-800/50 rounded-xl sm:rounded-2xl p-4 flex items-center justify-center">
                    <h2 class="text-lg sm:text-xl font-black text-white uppercase tracking-widest text-center">Boutique</h2>
                </div>

                <!-- Boutique Products - From runs with varied layouts -->
                <ContentList v-slot="{ list }" :query="runsQuery" :limit="3">
                    <template v-for="(run, runIdx) in list" :key="run._path">
                        <!-- Layout variation 1: 3+5 pattern -->
                        <template v-if="runIdx === 0">
                            <!-- Description Block -->
                            <div
                                class="col-span-1 sm:col-span-2 lg:col-span-3 bg-zinc-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-zinc-800 flex flex-col justify-between">
                                <div>
                                    <span class="text-[#FFD700] text-xs uppercase tracking-wider">Série</span>
                                    <h3 class="text-lg sm:text-2xl font-bold mt-2 mb-3">{{ run.title }}</h3>
                                    <p class="text-gray-400 text-sm leading-relaxed line-clamp-4 sm:line-clamp-6">{{ run.description }}</p>
                                </div>
                                <div class="mt-4 flex items-center justify-between">
                                    <span class="text-xs text-gray-500">{{ getDisplayItems(run).length }} tirages</span>
                                    <NuxtLink :to="`/series/${run.slug}`"
                                        class="text-[#FFD700] text-sm font-bold hover:text-white transition-colors">Voir →</NuxtLink>
                                </div>
                            </div>
                            <!-- Products - 5 cols -->
                            <div class="col-span-1 sm:col-span-2 lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <template v-for="(item, idx) in getDisplayItems(run).slice(0, 3)" :key="idx">
                                    <article :class="['bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer relative', idx === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-[3/4]']">
                                        <img v-if="item.displayImage" :src="item.displayImage" :alt="item.displayTitle"
                                            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div v-else class="absolute inset-0 bg-zinc-700 flex items-center justify-center">
                                            <span class="text-sm sm:text-xl font-bold text-[#FFD700]">{{ item.displayTitle }}</span>
                                        </div>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                        <div class="absolute bottom-0 left-0 right-0 p-3 translate-y-0 group-hover:translate-y-full group-hover:opacity-0 transition-all duration-300">
                                            <span class="text-[#FFD700] font-bold text-sm">{{ item.price }}€</span>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </template>

                        <!-- Layout variation 2: Full width mixed -->
                        <template v-if="runIdx === 1">
                            <!-- Header -->
                            <div class="col-span-1 sm:col-span-2 lg:col-span-8 bg-zinc-900/30 rounded-xl sm:rounded-2xl px-5 py-3 border border-zinc-800 flex items-center justify-between">
                                <h3 class="text-lg sm:text-xl font-bold">{{ run.title }}</h3>
                                <div class="flex items-center gap-4">
                                    <span class="text-xs text-gray-500">{{ getDisplayItems(run).length }} tirages</span>
                                    <NuxtLink :to="`/series/${run.slug}`"
                                        class="text-[#FFD700] text-sm font-bold hover:text-white transition-colors">Voir tout →</NuxtLink>
                                </div>
                            </div>
                            <!-- Products -->
                            <div class="col-span-1 sm:col-span-2 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                <template v-for="(item, idx) in getDisplayItems(run).slice(0, 4)" :key="idx">
                                    <article :class="['bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer relative', idx === 0 ? 'col-span-2 lg:col-span-2 aspect-[4/3]' : 'aspect-[3/4]']">
                                        <img v-if="item.displayImage" :src="item.displayImage" :alt="item.displayTitle"
                                            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div v-else class="absolute inset-0 bg-zinc-700 flex items-center justify-center">
                                            <span class="text-sm sm:text-2xl font-bold text-[#FFD700]">{{ item.displayTitle }}</span>
                                        </div>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                        <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-0 group-hover:translate-y-full group-hover:opacity-0 transition-all duration-300">
                                            <span class="text-[#FFD700] font-bold text-sm sm:text-base block">{{ item.price }}€</span>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </template>

                        <!-- Layout variation 3: Compact 4+4 -->
                        <template v-if="runIdx === 2">
                            <div class="col-span-1 sm:col-span-1 lg:col-span-4 bg-zinc-900/30 rounded-xl sm:rounded-2xl p-5 border border-zinc-800 flex flex-col justify-center">
                                <span class="text-[#FFD700] text-xs uppercase tracking-wider">Série</span>
                                <h3 class="text-base sm:text-xl font-bold mt-1">{{ run.title }}</h3>
                                <p class="text-gray-400 text-sm mt-2 line-clamp-2">{{ run.description }}</p>
                                <div class="mt-3 flex items-center justify-between">
                                    <span class="text-xs text-gray-500">{{ getDisplayItems(run).length }} tirages</span>
                                    <NuxtLink :to="`/series/${run.slug}`" class="text-[#FFD700] text-sm font-bold hover:text-white transition-colors">Découvrir →</NuxtLink>
                                </div>
                            </div>
                            <div class="col-span-1 sm:col-span-1 lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <template v-for="(item, idx) in getDisplayItems(run).slice(0, 3)" :key="idx">
                                    <article class="bg-zinc-800 rounded-xl overflow-hidden group cursor-pointer relative aspect-[3/4]">
                                        <img v-if="item.displayImage" :src="item.displayImage" :alt="item.displayTitle"
                                            class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div v-else class="absolute inset-0 bg-zinc-700 flex items-center justify-center">
                                            <span class="text-sm font-bold text-[#FFD700]">{{ item.displayTitle }}</span>
                                        </div>
                                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-300"></div>
                                        <div class="absolute bottom-0 left-0 right-0 p-2 translate-y-0 group-hover:translate-y-full group-hover:opacity-0 transition-all duration-300">
                                            <span class="text-[#FFD700] font-bold text-sm">{{ item.price }}€</span>
                                        </div>
                                    </article>
                                </template>
                            </div>
                        </template>
                    </template>
                </ContentList>

                <!-- Boutique Link -->
                <div class="col-span-1 sm:col-span-2 lg:col-span-8 bg-zinc-800 rounded-xl sm:rounded-xl p-4 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                    <NuxtLink to="/shop" class="text-[#FFD700] font-bold uppercase tracking-wider hover:text-white transition-colors text-sm sm:text-base">
                        Voir toute la boutique →
                    </NuxtLink>
                </div>

                <!-- ==================== PROJECTS ==================== -->
                <!-- Projects Title -->
                <div class="col-span-1 sm:col-span-2 lg:col-span-2 bg-zinc-800/50 rounded-xl sm:rounded-2xl p-4 flex items-center justify-center">
                    <h2 class="text-lg sm:text-xl font-black text-white uppercase tracking-widest text-center">Projects</h2>
                </div>

                <!-- Projects - Varied layout: 3, 2, 2, 1 pattern -->
                <ContentList v-slot="{ list }" :query="projectQuery" :limit="6">
                    <template v-for="(project, idx) in list" :key="project.permalink">
                        <article :class="[
                            'bg-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer relative hover:bg-zinc-700 transition-colors',
                            idx === 0 ? 'col-span-2 sm:col-span-1 lg:col-span-3' :
                            idx === 1 ? 'col-span-1 lg:col-span-2' :
                            idx === 2 ? 'col-span-2 sm:col-span-1 lg:col-span-2' :
                            idx === 3 ? 'col-span-1 sm:col-span-2 lg:col-span-1' :
                            'col-span-1 sm:col-span-1 lg:col-span-1'
                        ]">
                            <div :class="['relative overflow-hidden', idx === 0 ? 'aspect-[4/3] sm:aspect-[16/9]' : 'aspect-[3/4]']">
                                <img v-if="project.image" :src="project.image" :alt="project.title"
                                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                <div v-else class="w-full h-full bg-zinc-700 flex items-center justify-center">
                                    <span class="text-xl sm:text-2xl font-bold text-[#FFD700]">MJ</span>
                                </div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                                    <h3 class="text-sm sm:text-base font-bold truncate group-hover:text-[#FFD700] transition-colors">
                                        {{ project.title }}</h3>
                                    <p class="text-xs text-gray-400 mt-1 line-clamp-2">{{ project.description }}</p>
                                </div>
                            </div>
                            <NuxtLink :to="`/projets/${project.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
                        </article>
                    </template>
                </ContentList>

                <!-- ==================== VIDEO + STATS ==================== -->
                <!-- Video - Vertical -->
                <div class="col-span-1 sm:col-span-1 lg:col-span-1 lg:row-span-2 bg-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden">
                    <div class="aspect-[9/16] max-h-full relative">
                        <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Latest Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen class="absolute inset-0 w-full h-full"></iframe>
                    </div>
                </div>

                <!-- Stats -->
                <div class="col-span-1 sm:col-span-1 lg:col-span-7 bg-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                    <h2 class="text-xs sm:text-sm font-bold mb-4 text-gray-500 uppercase tracking-wider">Stats</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-xs sm:text-sm">Articles</span>
                            <span class="text-[#FFD700] font-bold text-sm">50+</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-xs sm:text-sm">Prints</span>
                            <span class="text-[#FFD700] font-bold text-sm">12</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-xs sm:text-sm">Projects</span>
                            <span class="text-[#FFD700] font-bold text-sm">4</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-xs sm:text-sm">Years</span>
                            <span class="text-[#FFD700] font-bold text-sm">2020+</span>
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

const getDisplayItems = (run: any) => {
    const items: any[] = []
    if (!run.products) return items
    
    run.products.forEach((product: any) => {
        if (product.images && product.images.length > 0) {
            product.images.forEach((img: string, imgIdx: number) => {
                items.push({
                    ...product,
                    displayImage: img,
                    displayTitle: product.images.length > 1 ? `${product.title} #${imgIdx + 1}` : product.title
                })
            })
        } else {
            items.push({
                ...product,
                displayImage: null,
                displayTitle: product.title
            })
        }
    })
    
    return items
}
</script>
