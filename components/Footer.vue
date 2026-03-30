<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <footer class="px-4 pb-10 pt-12 sm:px-6 lg:px-10">
    <div class="mx-auto max-w-7xl rounded-[32px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl sm:p-8">
      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div class="space-y-4">
          <p class="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-amber-300/85">
            Fin de visite, debut de conversation
          </p>
          <h2 class="max-w-2xl font-display text-3xl font-bold tracking-[-0.04em] text-slate-50 sm:text-4xl">
            Un univers personnel pour les projets sensibles, les systemes utiles et les collaborations nettes.
          </h2>
          <p class="max-w-2xl text-sm leading-7 text-slate-300">
            Racines guadeloupeennes, curiosite large, execution precise. Si le projet demande
            un regard, une structure ou une mise en forme forte, il y a matiere a echanger.
          </p>
        </div>

        <div class="space-y-3">
          <a
            href="mailto:hello@macojaune.com"
            class="inline-flex w-full items-center justify-between rounded-full border border-amber-300/30 bg-amber-300/12 px-5 py-4 text-sm font-semibold text-amber-100 transition duration-200 hover:border-amber-300/70 hover:bg-amber-300/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            hello@macojaune.com
            <span>↗</span>
          </a>
          <NuxtLink
            to="/link"
            class="inline-flex w-full items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition duration-200 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Reseaux, liens et points d'entree
            <span>↗</span>
          </NuxtLink>
        </div>
      </div>

      <div class="mt-8 grid gap-6 border-t border-white/10 pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition duration-200 hover:border-amber-300/40 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            {{ link.label }}
          </NuxtLink>
        </div>

        <div class="flex items-center gap-2">
          <a
            v-for="social in socials"
            :key="social.href"
            :href="social.href"
            :aria-label="social.label"
            target="_blank"
            rel="noreferrer"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition duration-200 hover:border-amber-300/40 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            v-html="social.icon"
          />
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p class="mb-0 text-sm text-slate-400">
          Macouille avec soin par
          <a
            class="font-semibold text-slate-200 transition hover:text-amber-100"
            href="https://marvinl.com?ref=yellowartshop"
            target="_blank"
            rel="noreferrer"
          >
            MarvinL.com
          </a>
        </p>
        <p class="mb-0 text-sm text-slate-500">
          Macojaune.com, territoire vivant entre image, code et narration.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
const links = [
  { label: 'A propos', to: '/a-propos' },
  { label: 'Blog', to: '/blog' },
  { label: 'Projets', to: '/projets' },
  { label: 'Paiement', to: '/payer' },
  { label: 'Liens utiles', to: '/link' },
  { label: 'Mentions legales', to: '/mentions-legales' },
  { label: 'CGV', to: '/conditions-generales-de-vente' },
  { label: 'Photozine #1', to: '/photozine' }
]

const instagram =
  '<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/> <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/> <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>';
const twitter =
  '<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path    d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>';
const facebook =
  '<svg class="h-8 w-8"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round">  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>';

const socials = [
  { label: 'Facebook', href: 'https://facebook.com/macojaune', icon: facebook },
  { label: 'Twitter', href: 'https://twitter.com/macojaune', icon: twitter },
  { label: 'Instagram', href: 'https://instagram.com/macojaune', icon: instagram }
]
</script>

<style lang="stylus" scoped></style>
