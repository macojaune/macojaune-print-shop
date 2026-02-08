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
          <NuxtLink to="/" class="bg-black text-white border-4 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-[#FFD700] hover:text-black transition-all" style="box-shadow: 4px 4px 0 #000; font-family: 'Unbounded', sans-serif;">
            HOME
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="w-full">
      <!-- Hero -->
      <section class="w-full bg-black text-white p-8 md:p-16">
        <div class="max-w-6xl mx-auto">
          <span class="text-[#FFD700] uppercase tracking-[0.5em] mb-4 block text-sm font-semibold">Creative Professional</span>
          <h2 class="text-6xl md:text-8xl lg:text-9xl leading-[0.85] uppercase mb-8" style="font-family: 'Unbounded', sans-serif;">
            MACO<br/>JAUNE
          </h2>
          <p class="text-xl md:text-2xl mb-10 max-w-2xl leading-relaxed">
            Photographe · Développeur · Entrepreneur · Grand curieux
          </p>
          <div class="flex flex-wrap gap-6">
            <NuxtLink to="/blog" class="bg-[#FFD700] text-black border-4 border-[#FFD700] px-8 py-4 font-bold uppercase text-lg hover:bg-white hover:border-white transition-all" style="font-family: 'Unbounded', sans-serif;">
              Blog
            </NuxtLink>
            <NuxtLink to="/shop" class="border-4 border-white px-8 py-4 font-bold uppercase text-lg hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all" style="font-family: 'Unbounded', sans-serif;">
              Shop
            </NuxtLink>
            <NuxtLink to="/projets" class="border-4 border-white px-8 py-4 font-bold uppercase text-lg hover:bg-[#FFD700] hover:text-black hover:border-[#FFD700] transition-all" style="font-family: 'Unbounded', sans-serif;">
              Projets
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Storytelling -->
      <section class="w-full bg-white border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 border-b-4 border-[#FFD700]">
          <h3 class="text-3xl md:text-4xl text-black uppercase" style="font-family: 'Unbounded', sans-serif;">À Propos</h3>
        </div>
        <div class="p-8 md:p-12 max-w-4xl">
          <p class="text-xl md:text-2xl leading-relaxed mb-6 text-black">
            Je suis Macojaune. Photographer, développeur, entrepreneur. Un couteau suisse créatif.
          </p>
          <p class="text-lg leading-relaxed mb-6 text-gray-700">
            À travers mon objectif, je capture des moments qui parlent. Des visages, des lieux, des instants qui méritent d'être figés.
          </p>
          <p class="text-lg leading-relaxed text-gray-700">
            À travers mon code, je construis des outils qui comptent. Des sites, des applications, des solutions qui vivent et évoluent.
          </p>
          <p class="text-lg leading-relaxed mt-6 text-gray-700">
            Ce site est mon territoire d'expression. Un lieu où mes projets, mes pensées et mon travail se retrouvent.
          </p>
        </div>
      </section>

      <!-- Blog - Articles with image background -->
      <section class="w-full bg-zinc-900 text-white border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 bg-black">
          <div class="w-8 h-8 bg-[#FFD700]"></div>
          <h3 class="text-3xl md:text-4xl text-white uppercase" style="font-family: 'Unbounded', sans-serif;">Blog</h3>
        </div>
        <div class="grid md:grid-cols-3 gap-0">
          <ContentList v-slot="{list}" :query="articleQuery" :limit="3">
            <article v-for="(article, idx) in list" :key="article.permalink"
                     :class="['relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-black', idx === 2 ? 'md:border-r-0' : '']">
              <div class="aspect-[3/2] relative overflow-hidden">
                <img v-if="article.image" :src="article.image" :alt="article.title" class="w-full h-full object-cover"/>
                <span v-else class="absolute inset-0 bg-gray-800 flex items-center justify-center text-4xl text-black font-bold" style="font-family: 'Unbounded', sans-serif;">IMG</span>
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-6">
                  <span class="text-[#FFD700] text-xs uppercase font-bold tracking-wider block mb-2">{{ formatDate(article.date) }}</span>
                  <h4 class="text-xl font-bold uppercase mb-3 leading-tight">{{ article.title }}</h4>
                </div>
                <NuxtLink :to="`/blog/${article.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
              </div>
            </article>
          </ContentList>
        </div>
      </section>

      <!-- Boutique -->
      <section class="w-full bg-white text-black border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 border-b-4 border-[#FFD700]">
          <h3 class="text-3xl md:text-4xl text-black uppercase" style="font-family: 'Unbounded', sans-serif;">Boutique</h3>
        </div>
        <div class="p-8 md:p-12">
          <ContentList v-slot="{list}" path="/runs" :limit="1">
            <div v-for="run in list" :key="run._path">
              <div class="grid md:grid-cols-2 gap-12 mb-10">
                <div>
                  <h4 class="text-4xl md:text-5xl font-bold uppercase mb-6 leading-tight" style="font-family: 'Unbounded', sans-serif;">{{ run.title }}</h4>
                  <p class="text-gray-600 text-lg leading-relaxed mb-6">{{ run.description }}</p>
                  <NuxtLink :to="`/series/${run.slug}`" class="inline-block bg-[#FFD700] text-black border-4 border-[#FFD700] px-8 py-4 font-bold uppercase hover:bg-white hover:border-white transition-all" style="font-family: 'Unbounded', sans-serif;">
                    Voir la série →
                  </NuxtLink>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div v-for="(product, idx) in run.products?.slice(0, 4)" :key="idx" class="bg-zinc-100 border-4 border-black p-4 rounded-xl">
                    <div class="aspect-square bg-zinc-200 mb-3 rounded-lg flex items-center justify-center">
                      <span class="text-2xl font-bold text-black" style="font-family: 'Unbounded', sans-serif;">{{ product.price }}€</span>
                    </div>
                    <span class="text-sm font-bold uppercase block mb-1 text-black">{{ product.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </ContentList>
        </div>
      </section>

      <!-- Projets - With images -->
      <section class="w-full bg-black text-white border-b-4 border-[#FFD700]">
        <div class="flex items-center gap-4 px-6 py-4">
          <h3 class="text-3xl md:text-4xl text-white uppercase" style="font-family: 'Unbounded', sans-serif;">Projets</h3>
        </div>
        <div class="grid md:grid-cols-4 gap-0">
          <ContentList v-slot="{list}" :query="projectQuery" :limit="4">
            <article v-for="(project, idx) in list" :key="project.permalink"
                     :class="['relative overflow-hidden border-b-4 md:border-b-0 md:border-r-4 border-zinc-800', idx === 3 ? 'md:border-r-0' : '']">
              <div class="aspect-[3/2] relative overflow-hidden">
                <img v-if="project.image" :src="project.image" :alt="project.title" class="w-full h-full object-cover"/>
                <div v-else class="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                  <span class="text-4xl text-[#FFD700] font-bold" style="font-family: 'Unbounded', sans-serif;">MJ</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-0 left-0 right-0 p-4">
                  <span class="text-xs text-gray-400 uppercase font-bold tracking-wider block mb-1">Projet #{{ idx + 1 }}</span>
                  <h4 class="text-base font-bold uppercase leading-tight">{{ project.title }}</h4>
                </div>
                <NuxtLink :to="`/projets/${project.permalink}`" class="absolute inset-0 z-10"></NuxtLink>
              </div>
            </article>
          </ContentList>
        </div>
      </section>

      <!-- Videos -->
      <section class="w-full bg-white text-black border-b-4 border-black">
        <div class="flex items-center gap-4 px-6 py-4 border-l-4 border-[#FFD700]">
          <h3 class="text-3xl md:text-4xl text-black uppercase" style="font-family: 'Unbounded', sans-serif;">Videos</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 md:p-12 pt-4">
          <a v-for="i in 4" :key="i" href="https://youtube.com/@macojaune" target="_blank" class="group block">
            <div class="aspect-video bg-zinc-100 border-4 border-black relative rounded-xl overflow-hidden mb-3">
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg class="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
            <span class="text-xs text-gray-500 uppercase font-bold tracking-wider block mb-1">Video {{ i }}</span>
            <h4 class="text-sm font-bold uppercase leading-tight">Archive video {{ i }}</h4>
          </a>
        </div>
      </section>

      <!-- Links -->
      <section class="w-full bg-black text-white p-8 md:p-12">
        <h3 class="text-3xl md:text-4xl text-center mb-10 uppercase" style="font-family: 'Unbounded', sans-serif;">Liens</h3>
        <div class="max-w-lg mx-auto">
          <NuxtLink to="/links" class="block bg-[#FFD700] text-black border-4 border-[#FFD700] px-8 py-6 font-bold uppercase hover:bg-white hover:border-white transition-all text-center rounded-2xl" style="font-family: 'Unbounded', sans-serif;">
            Voir tous les liens →
          </NuxtLink>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="w-full bg-[#FFD700] p-8 md:p-16 text-center">
        <h3 class="text-3xl md:text-4xl mb-4 uppercase text-black" style="font-family: 'Unbounded', sans-serif;">Newsletter</h3>
        <p class="text-black mb-8 max-w-md mx-auto">Reçois les updates directement dans ta boîte mail.</p>
        <form class="max-w-lg mx-auto flex gap-4">
          <input type="email" placeholder="ton@email.com" class="flex-1 bg-white border-4 border-black text-black px-6 py-4 font-bold rounded-xl"/>
          <button type="submit" class="bg-black text-white border-4 border-black px-8 py-4 font-bold uppercase hover:bg-white hover:text-black transition-all rounded-xl" style="font-family: 'Unbounded', sans-serif;">
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
