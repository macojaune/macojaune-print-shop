<template>
  <div class="relative w-full px-4 py-8 lg:px-6 lg:py-10">
    <div class="mx-auto flex max-w-[1680px] flex-col gap-16 lg:gap-24">
      <section class="grid gap-10 border-b border-amber-200/10 pb-12 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-16">
        <div class="lg:col-span-5">
          <p class="mb-4 text-[11px] uppercase tracking-[0.34em] text-amber-300/70">
            Maco (n.m.) : Curieux, touche-à-tout.
          </p>
          <h1 class="max-w-[10ch] font-display text-5xl leading-[0.86] text-white sm:text-6xl lg:text-7xl">
            Je suis
            <span class="text-amber-400">Macojaune.</span>
          </h1>
        </div>

        <div class="lg:col-span-7">
          <p class="max-w-[18ch] font-display text-3xl leading-[0.94] text-amber-400 sm:text-4xl lg:text-[3.4rem]">
            Photographe,
            curieux
            et passionné.
          </p>
          <p class="mt-5 max-w-[40ch] text-base leading-7 text-stone-200 lg:text-[1.12rem] lg:leading-8">
            Ici, tu peux voir mes réalisations, participer aux prochains projets et bien plus encore.
          </p>
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
const { toAssetUrl } = useAssetUrls()

const description =
    "Rencontrez Macojaune, le photographe-entrepreneur-développeur méga curieux ! Ce personnage public jeune et dynamique est avide de découvertes et ne recule devant rien pour vivre pleinement sa vie. Avec ses compétences en photographie et en développement web, il vous emmène dans un univers fascinant où la créativité et la technologie se mêlent harmonieusement. Suivez ses aventures entrepreneuriales les plus folles et ses projets les plus étonnants sur son site. Et n'oubliez pas de le rejoindre sur les réseaux sociaux pour vivre l'expérience Macojaune à fond !"

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
        { property: 'og:image', content: toAssetUrl('/pictures/dsc06261.jpg') },
        {
            property: 'twitter:card', content: 'summary_large_image'
        },
        { property: 'twitter:url', content: 'https://macojaune.com/' },
        { property: 'twitter:title', content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux' },
        {
            property: 'twitter:description',
            content: description
        },
        { property: 'twitter:image', content: toAssetUrl('/pictures/dsc06261.jpg') }
    ],
    script: [
        {
            type: 'application/ld+json',
            innerHTML: [
                { '@context': 'http://schema.org/' },
                { '@type': 'BreadcrumbList' },
                {
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
                }
            ]
        }
    ]
})
</script>
