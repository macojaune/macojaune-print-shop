<template>
  <div class="relative w-full px-4 py-8 lg:px-6 lg:py-10">
    <div class="mx-auto flex max-w-[1680px] flex-col gap-16 lg:gap-24">
      <section class="grid items-start gap-7 border-b border-amber-200/10 pb-12 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-6 lg:pb-16">
        <div class="lg:col-span-5 lg:self-end">
          <p class="mb-4 text-[11px] uppercase tracking-[0.34em] text-amber-300/70">
            Maco (n.m.) : Curieux, touche-à-tout.
          </p>
          <h1 class="max-w-[10ch] font-display text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            Je suis
            <span class="text-amber-400">Macojaune.</span>
          </h1>
        </div>

        <figure class="min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center">
          <NuxtLink
            to="/macomisyon"
            aria-labelledby="home-map-title home-map-action"
            data-umami-event="HomeClick"
            data-umami-section="hero"
            data-umami-label="Explorer Maco’misyon"
            data-umami-surface="homepage"
            class="home-map group block text-white"
          >
            <div class="relative">
              <img
                src="/macomisyon/jarry-1280.webp"
                srcset="/macomisyon/jarry-640.webp 640w, /macomisyon/jarry-1280.webp 1280w"
                sizes="(min-width: 1024px) 55vw, 100vw"
                width="1280"
                height="728"
                fetchpriority="high"
                alt="Vue en relief des rues de Jarry entre la mangrove et le port."
                class="block aspect-[2/1] w-full object-cover lg:aspect-video"
              >
              <span id="home-map-action" class="absolute bottom-0 right-0 inline-flex min-h-11 items-center gap-3 bg-amber-400 px-4 font-medium text-black group-hover:bg-amber-200">
                Explorer la carte <span aria-hidden="true">→</span>
              </span>
            </div>
            <div class="border-b border-amber-200/30 pb-3 pt-4">
              <h2 id="home-map-title" class="font-display text-4xl leading-none text-amber-400 sm:text-5xl">Maco’misyon</h2>
              <p class="mt-1 text-base leading-snug text-stone-200">Mes projets sur la carte de Jarry.</p>
            </div>
          </NuxtLink>
          <figcaption class="pt-2 text-xs leading-normal text-stone-400">
            © <a href="https://www.openstreetmap.org/copyright" class="underline">contributeurs OpenStreetMap</a>
            · Relief <a href="https://geoservices.ign.fr/rgealti" class="underline">IGN</a>
            / <a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" class="underline">Terrain Tiles</a>
          </figcaption>
        </figure>

        <div class="lg:col-span-5 lg:col-start-1 lg:row-start-2">
          <p class="max-w-[18ch] font-display text-3xl leading-[1.08] text-amber-400 sm:text-4xl lg:text-[3.4rem] lg:leading-[1.02]">
            Photographe,
            curieux
            et passionné.
          </p>
          <p class="mt-5 max-w-[40ch] text-base leading-7 text-stone-200 lg:text-[1.12rem] lg:leading-8">
            Ici, tu peux voir mes réalisations, participer aux prochains projets et bien plus encore.
          </p>

          <NuxtLink
            to="/a-propos"
            data-umami-event="HomeClick"
            data-umami-section="hero"
            data-umami-label="En savoir plus"
            data-umami-surface="homepage"
            class="mt-6 inline-flex min-h-11 w-fit items-center gap-2 border border-white/12 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-stone-300 transition hover:border-amber-200/28 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span>En savoir plus</span>
            <span aria-hidden="true">→</span>
          </NuxtLink>
        </div>
      </section>

      <section class="space-y-16 lg:space-y-24">
        <ProjectsSection />
        <RunsSection />
        <BlogSection />
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { buildSiteOgImagePath } from '../utils/og-images'

const description =
    "Rencontrez Macojaune, le photographe-entrepreneur-développeur méga curieux ! Ce personnage public jeune et dynamique est avide de découvertes et ne recule devant rien pour vivre pleinement sa vie. Avec ses compétences en photographie et en développement web, il vous emmène dans un univers fascinant où la créativité et la technologie se mêlent harmonieusement. Suivez ses aventures entrepreneuriales les plus folles et ses projets les plus étonnants sur son site. Et n'oubliez pas de le rejoindre sur les réseaux sociaux pour vivre l'expérience Macojaune à fond !"
const socialImage = `https://macojaune.com${buildSiteOgImagePath({
    title: 'Macojaune',
    eyebrow: 'Photographie',
    description: 'Séries photo, projets et univers visuel de Macojaune.',
    image: '/pictures/dsc06261.jpg'
})}`

useHead({
    title: 'Macojaune.com - Galerie photo',
    meta: [
        {
            name: 'title',
            content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'
        },
        {
            name: 'description',
            content: description
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://macojaune.com/' },
        { property: 'og:title', content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux' },
        {
            property: 'og:description',
            content: description
        },
        { property: 'og:image', content: socialImage },
        {
            property: 'twitter:card', content: 'summary_large_image'
        },
        { property: 'twitter:url', content: 'https://macojaune.com/' },
        { property: 'twitter:title', content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux' },
        {
            property: 'twitter:description',
            content: description
        },
        { property: 'twitter:image', content: socialImage }
    ],
    link: [
        {
            rel: 'canonical',
            href: 'https://macojaune.com/'
        }
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        item: {
                            '@id': 'https://macojaune.com',
                            name: 'Homepage'
                        }
                    }
                ]
            })
        }
    ]
})
</script>

<style scoped>
.home-map:focus-visible {
  outline: 2px solid #fcd34d;
  outline-offset: 4px;
}
</style>
