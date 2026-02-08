<template>
  <div class="neo-v3-page min-h-screen bg-[#fbbf24]">
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Unbounded:wght@400;700;900&display=swap" rel="stylesheet">
    
    <!-- Navigation -->
    <nav class="bg-white border-b-4 border-black p-4 sticky top-0 z-50">
      <div class="w-full px-4 md:px-8 flex items-center justify-between">
        <h1 class="text-xl md:text-2xl text-black uppercase tracking-widest" style="font-family: 'Unbounded', sans-serif;">
          @MACOJAUNE
        </h1>
        <div class="flex gap-4">
          <NuxtLink to="/" class="bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-[#fbbf24] hover:text-black transition-all" style="box-shadow: 4px 4px 0 #000; font-family: 'Unbounded', sans-serif;">
            HOME
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="w-full">
      <!-- Hero -->
      <section class="w-full bg-black text-white p-8 md:p-16">
        <div class="max-w-6xl mx-auto">
          <span class="text-[#fbbf24] uppercase tracking-[0.5em] mb-4 block text-sm font-semibold">Creative Professional</span>
          <h2 class="text-6xl md:text-8xl lg:text-9xl leading-[0.85] uppercase mb-8" style="font-family: 'Unbounded', sans-serif;">
            MACO<br/>JAUNE
          </h2>
          <p class="text-xl md:text-2xl mb-10 max-w-2xl leading-relaxed">
            Photographe · Développeur · Entrepreneur · Grand curieux
          </p>
          <div class="flex flex-wrap gap-6">
            <NuxtLink to="/blog" class="bg-[#fbbf24] text-black border-4 border-[#fbbf24] px-8 py-4 font-bold uppercase text-lg hover:bg-white hover:border-white transition-all" style="font-family: 'Unbounded', sans-serif;">
              Articles
            </NuxtLink>
            <NuxtLink to="/shop" class="border-4 border-white px-8 py-4 font-bold uppercase text-lg hover:bg-[#fbbf24] hover:text-black hover:border-[#fbbf24] transition-all" style="font-family: 'Unbounded', sans-serif;">
              Shop
            </NuxtLink>
            <NuxtLink to="/projets" class="border-4 border-white px-8 py-4 font-bold uppercase text-lg hover:bg-[#fbbf24] hover:text-black hover:border-[#fbbf24] transition-all" style="font-family: 'Unbounded', sans-serif;">
              Projets
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Derniers Articles -->
      <section class="w-full bg-white border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 bg-black">
          <div class="w-8 h-8 bg-[#fbbf24]"></div>
          <h3 class="text-3xl md:text-4xl text-white uppercase" style="font-family: 'Unbounded', sans-serif;">Derniers Articles</h3>
        </div>
        <div class="grid md:grid-cols-3 gap-0">
          <ContentList v-slot="{list}" :query="articleQuery" :limit="3">
            <article v-for="(article, idx) in list" :key="article.permalink" 
                     :class="['bg-white border-b-4 md:border-b-0 md:border-r-4 border-black p-8', idx === 2 ? 'md:border-r-0' : '']">
              <div class="aspect-[3/2] bg-gray-100 mb-6 flex items-center justify-center overflow-hidden border-4 border-black">
                <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-full object-cover"/>
                <span v-else class="text-4xl text-black font-bold" style="font-family: 'Unbounded', sans-serif;">IMG</span>
              </div>
              <span class="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-2">{{ formatDate(article.date) }}</span>
              <h4 class="text-xl font-bold uppercase mb-3 leading-tight">{{ article.title }}</h4>
              <p class="text-gray-600 mb-4 line-clamp-3 text-sm">{{ article.description }}</p>
              <NuxtLink :to="`/blog/${article.permalink}`" class="inline-block bg-black text-white border-4 border-black px-6 py-2 font-bold uppercase text-sm hover:bg-[#fbbf24] hover:text-black transition-all" style="font-family: 'Unbounded', sans-serif;">
                Lire
              </NuxtLink>
            </article>
          </ContentList>
        </div>
      </section>

      <!-- Yellow Art Shop -->
      <section class="w-full bg-black text-white border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 border-b-4 border-[#fbbf24]">
          <h3 class="text-3xl md:text-4xl text-[#fbbf24] uppercase" style="font-family: 'Unbounded', sans-serif;">Yellow Art Shop</h3>
        </div>
        <div class="p-8 md:p-12">
          <ContentList v-slot="{list}" path="/runs" :limit="1">
            <div v-for="run in list" :key="run._path">
              <div class="grid md:grid-cols-2 gap-12 mb-10">
                <div>
                  <h4 class="text-4xl md:text-5xl font-bold uppercase mb-6 leading-tight" style="font-family: 'Unbounded', sans-serif;">{{ run.title }}</h4>
                  <p class="text-gray-400 text-lg leading-relaxed mb-6">{{ run.description }}</p>
                  <NuxtLink :to="`/series/${run.slug}`" class="inline-block bg-[#fbbf24] text-black border-4 border-[#fbbf24] px-8 py-4 font-bold uppercase hover:bg-white hover:border-white transition-all" style="font-family: 'Unbounded', sans-serif;">
                    Voir la série →
                  </NuxtLink>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="(product, idx) in run.products?.slice(0, 4)" :key="idx" class="bg-white border-4 border-[#fbbf24] p-4">
                    <span class="text-sm font-bold uppercase block mb-2 text-black">{{ product.title }}</span>
                    <span class="text-xl font-bold text-[#fbbf24] block" style="font-family: 'Unbounded', sans-serif;">{{ product.price }}€</span>
                  </div>
                </div>
              </div>
            </div>
          </ContentList>
        </div>
      </section>

      <!-- Projets -->
      <section class="w-full bg-white border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4">
          <h3 class="text-3xl md:text-4xl text-black uppercase" style="font-family: 'Unbounded', sans-serif;">Projets Photo</h3>
        </div>
        <div class="grid md:grid-cols-4 gap-0">
          <ContentList v-slot="{list}" :query="projectQuery" :limit="4">
            <article v-for="(project, idx) in list" :key="project.permalink" 
                     :class="['bg-white border-b-4 md:border-b-0 md:border-r-4 border-black p-6', idx === 3 ? 'md:border-r-0' : '']">
              <span class="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-3">Projet #{{ idx + 1 }}</span>
              <h4 class="text-lg font-bold uppercase mb-2 leading-tight">{{ project.title }}</h4>
              <p class="text-xs text-gray-500 mb-4 uppercase font-bold">{{ formatDate(project.date) }}</p>
              <NuxtLink :to="`/projets/${project.permalink}`" class="text-[#fbbf24] font-bold uppercase text-sm hover:text-black transition-colors" style="font-family: 'Unbounded', sans-serif;">
                →
              </NuxtLink>
            </article>
          </ContentList>
        </div>
      </section>

      <!-- Links -->
      <section class="w-full bg-black text-white p-8 md:p-12">
        <h3 class="text-3xl md:text-4xl text-center mb-10 uppercase" style="font-family: 'Unbounded', sans-serif;">Retrouve-moi</h3>
        <div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <ContentList v-slot="{list}" path="/links">
            <a v-for="link in list[0]?.link" :key="link.url" :href="link.url" target="_blank" 
               class="bg-white text-black border-4 border-white p-4 font-bold uppercase hover:bg-[#fbbf24] hover:border-[#fbbf24] transition-all text-center" style="font-family: 'Unbounded', sans-serif;">
              {{ link.text }}
            </a>
          </ContentList>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="w-full bg-[#fbbf24] p-8 md:p-16 text-center">
        <h3 class="text-3xl md:text-4xl mb-4 uppercase text-black" style="font-family: 'Unbounded', sans-serif;">Newsletter</h3>
        <p class="text-black mb-8 max-w-md mx-auto">Reçois les updates directement dans ta boîte mail.</p>
        <form class="max-w-lg mx-auto flex gap-4">
          <input type="email" placeholder="ton@email.com" class="flex-1 bg-white border-4 border-black text-black px-6 py-4 font-bold"/>
          <button type="submit" class="bg-black text-white border-4 border-black px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all" style="font-family: 'Unbounded', sans-serif;">
            S'inscrire
          </button>
        </form>
      </section>

      <!-- Footer -->
      <footer class="w-full bg-white border-t-4 border-black p-6 text-center">
        <p class="uppercase font-bold tracking-widest" style="font-family: 'Unbounded', sans-serif;">
          MACOJAUNE.COM /// NEO V3
        </p>
      </footer>
    </main>
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

const projectQuery: QueryBuilderParams = {
  path: '/projects',
  where: [{ draft: false }],
  sort: [{ date: -1 }]
}

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

useHead({
  title: 'Macojaune - Neo-Brutalist V3',
  meta: [{ name: 'description', content: 'Portfolio de Macojaune - Neo-Brutalist V3' }]
})
</script>
