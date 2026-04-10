<template>
  <footer class="mt-20 pt-12 bg-black justify-self-end">
    <div class="container mx-auto px-4 text-left">
      <NuxtLink
        class="font-display text-4xl text-amber-400 transition-colors ease-in hover:text-orange-500"
        to="/"
        data-umami-event="SiteNavigationClick"
        data-umami-section="footer_brand"
        data-umami-label="Macojaune.com"
        data-umami-surface="global_footer"
      >
        Macojaune.com
      </NuxtLink>
    </div>
    <div class="text-center">
      <p class="text-white">
        Machouillé avec
        <svg class="inline h-8 w-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
        par
        <a
          class="text-red-500 font-semibold transition-all ease-in hover:text-amber-400 hover:underline"
          href="https://marvinl.com?ref=yellowartshop"
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="SiteNavigationClick"
          data-umami-section="footer_credit"
          data-umami-label="MarvinL.com"
          data-umami-surface="global_footer"
        >MarvinL.com</a>
      </p>
    </div>
    <div class="my-6 flex flex-row justify-center gap-4 md:gap-3">
      <a class="text-white hover:text-amber-400" href="https://facebook.com/macojaune" aria-label="Facebook" data-umami-event="SiteNavigationClick" data-umami-section="footer_social" data-umami-label="Facebook" data-umami-surface="global_footer">
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </a>
      <a class="text-white hover:text-amber-400" href="https://twitter.com/macojaune" aria-label="Twitter" data-umami-event="SiteNavigationClick" data-umami-section="footer_social" data-umami-label="Twitter" data-umami-surface="global_footer">
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      </a>
      <a class="text-white hover:text-amber-400" href="https://instagram.com/macojaune" aria-label="Instagram" data-umami-event="SiteNavigationClick" data-umami-section="footer_social" data-umami-label="Instagram" data-umami-surface="global_footer">
        <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>
    </div>
    <div class="container mx-auto py-8 mb-12">
      <div class="grid grid-cols-2 lg:grid-cols-5 justify-center gap-5 grid-flow-row-dense text-amber-300">
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/a-propos" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="À propos" data-umami-surface="global_footer">À propos
        </NuxtLink>

        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/payer" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Paiement" data-umami-surface="global_footer">Paiement
        </NuxtLink>
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/link" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Liens utiles" data-umami-surface="global_footer">Liens utiles
        </NuxtLink>
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/projets" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Projets" data-umami-surface="global_footer">Projets
        </NuxtLink>
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/galerie" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Galerie" data-umami-surface="global_footer">Galerie
        </NuxtLink>
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/mentions-legales" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Mentions légales" data-umami-surface="global_footer">Mentions
          Légales
        </NuxtLink>
        <NuxtLink
          class="text-center lg:text-left text-amber-400 hover:text-orange-500"
          to="/conditions-generales-de-vente"
          data-umami-event="SiteNavigationClick"
          data-umami-section="footer_links"
          data-umami-label="CGV"
          data-umami-surface="global_footer"
        >CGV
        </NuxtLink>
        <NuxtLink class="text-center lg:text-left text-amber-400 hover:text-orange-500" to="/blog" data-umami-event="SiteNavigationClick" data-umami-section="footer_links" data-umami-label="Blog" data-umami-surface="global_footer">Blog
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

<style lang="stylus" scoped></style>
