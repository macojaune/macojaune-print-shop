<template>
  <div class="bento-page min-h-screen bg-[#0a0a0a] text-white">
    
    <!-- Full-width header -->
    <header class="px-6 md:px-12 pt-16 pb-8">
      <h1 class="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
        <span class="text-amber-500">@</span>MACOJAUNE
      </h1>
      <p class="text-gray-400 text-base md:text-lg uppercase tracking-[0.3em]">
        Photographer · Developer · Entrepreneur
      </p>
    </header>

    <!-- Full-width bento grid -->
    <main class="px-6 md:px-12 pb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Featured Article - Large Card -->
        <ContentList v-slot="{list}" :query="articleQuery" :limit="1">
          <article v-for="article in list" :key="article.permalink" class="lg:col-span-2 lg:row-span-2 bg-zinc-800 rounded-3xl overflow-hidden group cursor-pointer hover:bg-zinc-700 transition-all duration-300">
            <div class="aspect-[4/3] relative overflow-hidden">
              <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              <div v-else class="w-full h-full bg-zinc-700 flex items-center justify-center">
                <span class="text-8xl font-black text-amber-500">MJ</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <span class="text-amber-500 text-xs uppercase tracking-wider">Latest Article</span>
                <h2 class="text-3xl md:text-4xl mt-2 font-bold leading-tight">{{ article.title }}</h2>
              </div>
            </div>
            <NuxtLink :to="`/blog/${article.permalink}`" class="block p-6 border-t border-zinc-700">
              <span class="text-gray-500 text-sm">Read article →</span>
            </NuxtLink>
          </article>
        </ContentList>

        <!-- Section Title: Articles -->
        <div class="bg-zinc-800 rounded-3xl p-8 flex items-center justify-center">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Articles</h2>
        </div>

        <!-- Recent Articles -->
        <ContentList v-slot="{list}" :query="recentArticlesQuery" :limit="2">
          <article v-for="(article, idx) in list" :key="article.permalink" class="bg-zinc-800 rounded-3xl p-6 group cursor-pointer hover:bg-zinc-700 transition-colors">
            <span class="text-gray-600 text-xs uppercase">Article {{ idx + 2 }}</span>
            <h3 class="text-lg font-bold mt-2 group-hover:text-amber-500 transition-colors">{{ article.title }}</h3>
            <p class="text-xs text-gray-500 mt-2 line-clamp-2">{{ article.description }}</p>
            <NuxtLink :to="`/blog/${article.permalink}`" class="inline-block mt-3 text-amber-500 text-sm">
              Read →
            </NuxtLink>
          </article>
        </ContentList>

        <!-- Photozine Block -->
        <NuxtLink to="/photozine" class="bg-zinc-800 rounded-3xl p-8 flex flex-col justify-between min-h-[280px] hover:bg-zinc-700 transition-colors">
          <div>
            <span class="text-gray-500 text-xs uppercase">New</span>
            <h2 class="text-3xl font-bold text-white mt-2">Photozine #1</h2>
          </div>
          <span class="inline-block bg-amber-500 text-black px-6 py-3 rounded-2xl font-bold text-center">Pre-order</span>
        </NuxtLink>

        <!-- Newsletter Block -->
        <div class="bg-zinc-800 rounded-3xl p-8 flex flex-col justify-between min-h-[280px]">
          <div>
            <span class="text-gray-500 text-xs uppercase">Stay Updated</span>
            <h2 class="text-2xl font-bold mt-2">Newsletter</h2>
          </div>
          <div class="space-y-3">
            <input type="email" placeholder="your@email.com" class="w-full bg-zinc-700 border-0 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500"/>
            <button class="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition-colors">Subscribe</button>
          </div>
        </div>

        <!-- Section Title: Shop -->
        <div class="lg:col-span-2 bg-zinc-800 rounded-3xl p-8 flex items-center justify-center">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Yellow Art Shop</h2>
        </div>

        <!-- Shop Products -->
        <ContentList v-slot="{list}" path="/runs" :limit="1">
          <article v-for="run in list" :key="run._path" class="lg:col-span-2 bg-zinc-800 rounded-3xl p-8">
            <h3 class="text-3xl font-bold mt-2 mb-4">{{ run.title }}</h3>
            <p class="text-gray-400 mb-6 line-clamp-2">{{ run.description }}</p>
            <div class="flex gap-2 mb-6 flex-wrap">
              <span v-for="(product, idx) in run.products?.slice(0, 4)" :key="idx" class="bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                {{ product.price }}€
              </span>
            </div>
            <NuxtLink :to="`/series/${run.slug}`" class="inline-block w-full text-center bg-white text-black py-4 rounded-2xl font-bold hover:bg-amber-500 transition-colors">
              Discover Series
            </NuxtLink>
          </article>
        </ContentList>

        <!-- Section Title: Projects -->
        <div class="bg-zinc-800 rounded-3xl p-8 flex items-center justify-center">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Projects</h2>
        </div>

        <!-- Projects -->
        <ContentList v-slot="{list}" :query="projectQuery" :limit="4">
          <article v-for="(project, idx) in list" :key="project.permalink" class="bg-zinc-800 rounded-3xl p-6 group cursor-pointer hover:bg-zinc-700 transition-colors">
            <span class="text-gray-600 text-xs uppercase">Project {{ idx + 1 }}</span>
            <h3 class="text-xl mt-3 font-bold group-hover:text-amber-500 transition-colors">{{ project.title }}</h3>
            <NuxtLink :to="`/projets/${project.permalink}`" class="inline-block mt-4 text-amber-500 text-sm">
              View →
            </NuxtLink>
          </article>
        </ContentList>

        <!-- Section Title: Links -->
        <div class="bg-zinc-800 rounded-3xl p-8 flex items-center justify-center">
          <h2 class="text-3xl font-black text-white uppercase tracking-tight text-center">Links</h2>
        </div>

        <!-- Quick Links -->
        <ContentList v-slot="{list}" path="/links">
          <div v-if="list[0]?.link" class="lg:col-span-2 grid grid-cols-2 gap-4">
            <a v-for="link in list[0].link.slice(0, 4)" :key="link.url" :href="link.url" target="_blank" class="bg-zinc-800 rounded-2xl p-5 hover:bg-zinc-700 transition-colors">
              <span class="text-lg font-bold block truncate">{{ link.text }}</span>
              <span v-if="link.description" class="text-xs text-gray-500 truncate block mt-1">{{ link.description }}</span>
            </a>
          </div>
        </ContentList>

        <!-- YouTube -->
        <div class="bg-zinc-800 rounded-3xl p-8 flex flex-col justify-center text-center">
          <h2 class="text-2xl font-bold text-white mb-2">YouTube</h2>
          <p class="text-gray-500 text-sm mb-6">Latest videos</p>
          <a href="https://youtube.com/@macojaune" target="_blank" class="inline-block bg-amber-500 text-black px-6 py-3 rounded-2xl font-bold hover:bg-white transition-colors">
            Watch →
          </a>
        </div>

        <!-- Stats -->
        <div class="bg-zinc-800 rounded-3xl p-8">
          <h2 class="text-xl font-bold mb-6">Stats</h2>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Articles</span>
              <span class="text-amber-500 font-bold">50+</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Prints</span>
              <span class="text-amber-500 font-bold">6 series</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Projects</span>
              <span class="text-amber-500 font-bold">4 active</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Years</span>
              <span class="text-amber-500 font-bold">2020+</span>
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
