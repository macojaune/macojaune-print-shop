<template>
  <div class="relative w-full px-4 py-8 lg:px-6 lg:py-10">
    <div class="mx-auto flex max-w-[1680px] flex-col gap-16 lg:gap-24">
      <section class="grid gap-10 border-b border-amber-200/10 pb-12 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-16">
        <div class="lg:col-span-5">
          <p class="mb-4 text-[11px] uppercase tracking-[0.34em] text-amber-300/70">
            Maco (n.m.) : Curieux, touche-à-tout.
          </p>
          <h1 class="max-w-[10ch] font-display text-5xl leading-[0.92] text-white sm:text-6xl lg:text-7xl">
            Je suis
            <span class="text-amber-400">Macojaune.</span>
          </h1>
        </div>

        <div class="lg:col-span-7">
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
