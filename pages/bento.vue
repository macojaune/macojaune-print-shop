<template>
  <div class="bento-page min-h-screen bg-[#0a0a0a] text-white">
    <!-- Full-width header -->
    <header class="px-6 md:px-12 pt-16 pb-8">
      <h1 class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
        <span class="text-[#FFD700]">@</span>MACOJAUNE
      </h1>
      <p class="text-gray-400 text-base md:text-lg uppercase tracking-[0.3em]">
        Photographer · Developer · Entrepreneur
      </p>
    </header>

    <!-- Full-width bento grid -->
    <main class="px-6 md:px-12 pb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Featured Article - Large Card with image as background -->
        <ContentList v-slot="{list}" :query="articleQuery" :limit="1">
          <article v-for="article in list" :key="article.permalink" class="lg:col-span-2 lg:row-span-2 rounded-3xl overflow-hidden group cursor-pointer relative">
            <div class="absolute inset-0">
              <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              <div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span class="text-8xl font-black text-[#FFD700]">MJ</span>
              </div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <span class="text-[#FFD700] text-xs uppercase tracking-wider">Latest Article</span>
              <h2 class="text-3xl md:text-4xl mt-2 font-bold leading-tight">{{ article.title }}</h2>
            </div>
            <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
          </article>
        </ContentList>

        <!-- Section Title: Blog -->
        <div class="bg-zinc-900/50 rounded-3xl p-8 flex items-center justify-center border border-zinc-800">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Blog</h2>
        </div>

        <!-- Recent Articles - Image as background -->
        <ContentList v-slot="{list}" :query="recentArticlesQuery" :limit="2">
          <article v-for="(article, idx) in list" :key="article.permalink" class="rounded-3xl overflow-hidden group cursor-pointer relative h-full">
            <div class="absolute inset-0">
              <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              <div v-else class="w-full h-full bg-zinc-800"></div>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <span class="text-gray-500 text-xs uppercase">Article {{ idx + 2 }}</span>
              <h3 class="text-lg font-bold mt-2 group-hover:text-[#FFD700] transition-colors">{{ article.title }}</h3>
              <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
            </div>
          </article>
        </ContentList>

        <!-- Newsletter Block -->
        <div class="bg-zinc-900/50 rounded-3xl p-8 flex flex-col justify-between border border-zinc-800">
          <div>
            <span class="text-gray-500 text-xs uppercase">Stay Updated</span>
            <h2 class="text-2xl font-bold mt-2">Newsletter</h2>
          </div>
          <div class="space-y-3">
            <input type="email" placeholder="your@email.com" class="w-full bg-zinc-800 border-0 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500"/>
            <button class="w-full bg-[#FFD700] text-black py-3 rounded-xl font-bold hover:bg-white transition-colors">Subscribe</button>
          </div>
        </div>

        <!-- Photozine Block -->
        <NuxtLink to="/photozine" class="bg-zinc-900/50 rounded-3xl p-8 flex flex-col justify-between min-h-[280px] border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <div>
            <span class="text-gray-500 text-xs uppercase">New</span>
            <h2 class="text-3xl font-bold text-white mt-2">Photozine #1</h2>
          </div>
          <span class="inline-block bg-[#FFD700] text-black px-6 py-3 rounded-2xl font-bold text-center">Pre-order</span>
        </NuxtLink>

        <!-- Storytelling Section -->
        <section class="lg:col-span-2 bg-zinc-100 rounded-3xl p-8 lg:p-12">
          <span class="text-gray-500 text-xs uppercase tracking-wider">About</span>
          <h2 class="text-2xl md:text-3xl font-bold text-black mt-4 mb-6 leading-tight">
            Capturer l'instant, construire l'avenir
          </h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            Je suis Macojaune. Photographer, développeur, entrepreneur. Un couteau suisse créatif.
          </p>
          <p class="text-gray-700 leading-relaxed mb-4">
            À travers mon objectif, je capture des moments qui parlent. À travers mon code, je construis des outils qui comptent.
          </p>
          <p class="text-gray-700 leading-relaxed">
            Ce site est mon territoire d'expression. Un lieu où mes projets, mes pensées et mon travail se retrouvent.
          </p>
        </section>

        <!-- Section Title: Shop -->
        <div class="lg:col-span-4 bg-zinc-900/30 rounded-3xl p-6 flex items-center justify-center border-t-2 border-[#FFD700]">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Boutique</h2>
        </div>

        <!-- Shop - Full Width -->
        <ContentList v-slot="{list}" path="/runs" :limit="1">
          <div v-for="run in list" :key="run._path" class="lg:col-span-4 bg-zinc-900/30 rounded-3xl p-8 border border-zinc-800">
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-3xl font-bold mt-2 mb-4">{{ run.title }}</h3>
                <p class="text-gray-400 mb-6 line-clamp-3">{{ run.description }}</p>
                <NuxtLink :to="`/series/${run.slug}`" class="inline-block w-full text-center bg-[#FFD700] text-black py-4 rounded-2xl font-bold hover:bg-white transition-colors">
                  Découvrir la série
                </NuxtLink>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="(product, idx) in run.products?.slice(0, 4)" :key="idx" class="bg-zinc-800 rounded-xl overflow-hidden group">
                  <div class="aspect-square bg-zinc-700 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <span class="absolute bottom-2 left-2 text-[#FFD700] font-bold">{{ product.price }}€</span>
                  </div>
                  <div class="p-3">
                    <span class="text-sm font-bold block truncate">{{ product.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContentList>

        <!-- Section Title: Projects -->
        <div class="lg:col-span-4 bg-zinc-900/50 rounded-3xl p-6 flex items-center justify-center border-l-4 border-[#FFD700]">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Projects</h2>
        </div>

        <!-- Projects - With images -->
        <ContentList v-slot="{list}" :query="projectQuery" :limit="4">
          <article v-for="(project, idx) in list" :key="project.permalink" class="rounded-3xl overflow-hidden group cursor-pointer relative h-full">
            <div class="aspect-[4/3] relative overflow-hidden">
              <img v-if="project.image" :src="project.image" :alt="project.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              <div v-else class="w-full h-full bg-zinc-800 flex items-center justify-center">
                <span class="text-4xl font-bold text-[#FFD700]">MJ</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-6">
              <span class="text-gray-500 text-xs uppercase">Project {{ idx + 1 }}</span>
              <h3 class="text-xl mt-1 font-bold group-hover:text-[#FFD700] transition-colors">{{ project.title }}</h3>
              <NuxtLink :to="`/projets/${project.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
            </div>
          </article>
        </ContentList>

        <!-- YouTube Videos Section -->
        <div class="lg:col-span-4 bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-black text-white uppercase tracking-tight">Videos</h2>
            <a href="https://youtube.com/@macojaune" target="_blank" class="text-[#FFD700] text-sm font-bold hover:text-white transition-colors">See all →</a>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a v-for="i in 4" :key="i" href="https://youtube.com/@macojaune" target="_blank" class="group block rounded-xl overflow-hidden">
              <div class="aspect-video bg-zinc-800 relative">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              <div class="p-3 bg-zinc-800">
                <span class="text-xs text-gray-500 uppercase">Video {{ i }}</span>
                <h4 class="text-sm font-bold mt-1 truncate">Archive video {{ i }}</h4>
              </div>
            </a>
          </div>
        </div>

        <!-- Stats -->
        <div class="bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800">
          <h2 class="text-xl font-bold mb-6">Stats</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Articles</span>
              <span class="text-[#FFD700] font-bold">50+</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Prints</span>
              <span class="text-[#FFD700] font-bold">6 series</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Projects</span>
              <span class="text-[#FFD700] font-bold">4 active</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Years</span>
              <span class="text-[#FFD700] font-bold">2020+</span>
            </div>
          </div>
        </div>

        <!-- Links - Simplified to single card pointing to page -->
        <div class="lg:col-span-3 bg-zinc-900/50 rounded-3xl p-8 flex flex-col justify-center border border-zinc-800">
          <div class="text-center">
            <h2 class="text-2xl font-black text-white uppercase tracking-tight mb-4">Liens Utiles</h2>
            <p class="text-gray-500 mb-6">Toutes mes présences et liens en un clic</p>
            <NuxtLink to="/links" class="inline-block bg-[#FFD700] text-black px-8 py-4 rounded-2xl font-bold hover:bg-white transition-colors">
              Voir tous les liens →
            </NuxtLink>
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
