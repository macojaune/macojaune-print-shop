<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <header class="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-10">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[26px] border border-white/10 bg-slate-950/50 px-4 py-4 backdrop-blur-xl sm:px-6">
      <NuxtLink
        class="min-w-0 transition-colors duration-200 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        to="/"
        itemprop="brand"
        itemtype="http://schema.org/Organization"
      >
        <p class="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-400">
          {{ eyebrow }}
        </p>
        <component
          :is="route.path === '/' ? 'h1' : 'p'"
          class="font-display text-2xl font-bold tracking-[-0.04em] text-slate-50 sm:text-3xl"
        >
          Macojaune
        </component>
      </NuxtLink>

      <nav aria-label="Navigation principale" class="hidden items-center gap-2 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition duration-200 hover:bg-white/8 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          :class="route.path === item.to ? 'bg-white/10 text-amber-100' : ''"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink
        to="/link"
        class="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/12 px-4 py-2 text-sm font-semibold text-amber-100 transition duration-200 hover:border-amber-300/70 hover:bg-amber-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        Contact
        <span>↗</span>
      </NuxtLink>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();

const navItems = [
    { label: 'Accueil', to: '/' },
    { label: 'Projets', to: '/projets' },
    { label: 'Blog', to: '/blog' },
    { label: 'A propos', to: '/a-propos' }
] as const

const eyebrow = computed(() => {
    if (route.path.startsWith('/blog')) {
        return 'Notes, veille et retours'
    }

    if (route.path.startsWith('/projets')) {
        return 'Photographie et experimentation'
    }

    if (route.path.startsWith('/shop')) {
        return 'Editions et tirages'
    }

    return 'Photographie, code et contenu'
})
</script>
