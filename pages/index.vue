<template>
  <div class="relative w-full px-4 py-8">
    <div class="flex flex-col gap-5 lg:flex-row lg:justify-around">
      <section class="lg:w-1/4">
        <h2 class="mb-2  font-display text-2xl text-amber-600 lg:text-3xl">
          Selon notre ami CHATGPT:
        </h2>
        <p class="text-white lg:text-right">
          Macojaune est un personnage public jeune et dynamique, passionné par la vie, la
          photographie et l'entrepreneuriat. Il est connu pour ses talents de photographe et ses compétences en
          développement web, ainsi que pour son parcours et sa personnalité atypique. Macojaune partage
          régulièrement son travail et ses projets sur les réseaux sociaux et son site internet, où il vend également
          des
          tirages de ses clichés.
        </p>
      </section>
      <section class="lg:w-2/4">
        <h2 class="mb-2 font-display text-2xl text-amber-400 lg:text-3xl">
          Selon moi…
        </h2>
        <p class="text-white lg:text-lg">
          C'est plutôt juste, oui ? Assez bluffé je suis. <br class="inline lg:hidden"> Bon, d'accord… <br
          class="hidden lg:inline"
        >
          Poster
          régulièrement sur son site internet c'est pas spécialement vrai.
          <br class="inline lg:hidden">
          Si tu lis ceci, c'est que j'ai
          publié cette mise à jour tant repoussée et que je tente d'organiser un fonctionnement cool et dynamique par
          ici.
        </p>
        <div
          class="group mt-12 rounded-sm bg-amber-400/40 p-5 transition-all ease-in hover:bg-amber-400/40"
        >
          <h3 class="mb-4 font-display text-4xl text-white lg:mb-2">
            La boutique s'est déplacée !
          </h3>
          <p class="font-sans text-base text-white">
            Elle n'a pas résisté à l'appel du mouvement
            #DigitalNomad
            et a
            fait
            ses
            valises
            pour un
            nouvel
            emplacement ! <br class="inline lg:hidden">
            Pour découvrir ma sélection de tirages et ajouter une touche de créativité à ton salon
          </p>
          <div class="mt-2 flex w-full justify-end">
            <nuxt-link
              class="bg-black p-3 text-white transition-colors hover:text-yellow-400 group-hover:animate-pulse"
              to="/shop"
            >
              <span class="text-white hover:text-yellow-400">C'est par ici !</span>
            </nuxt-link>
          </div>
        </div>
      </section>
    </div>
    <div class="pt-8">
      <p class="mb-2 text-white lg:mb-0">
        On continue avec les nouveautés
      </p>
      <h2 class="mb-3 text-center font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
        Découvre et participe à mes projets photo en cours
        <small class="font-sans text-base font-normal italic text-red-500">c'est le moment !</small>
      </h2>
      <ContentList v-slot="{list}" :query="projectQuery">
        <div class="mb-2 grid grid-cols-2 gap-5 lg:grid-cols-3 lg:grid-rows-none">
          <nuxt-link
            v-for="project in list"
            :key="project.id"
            :to="`/blog/${project.permalink}?project=${project.permalink.substring(7)}`"
            class="group relative aspect-video rounded-sm"
          >
            <div
              class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"
            />
            <nuxt-img
              :src="project.image"
              sizes="xs:25vw lg:360px"
              format="webp"
              placeholder
              class="absolute inset-0 z-0 h-full"
            />
            <div class="absolute bottom-0 z-20 p-5">
              <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
                {{
                  project.title
                }}
              </h4>
              <p v-if="project.date">{{ moment(project.date).format('ll') }}</p>
            </div>
          </nuxt-link>
        </div>
        <div v-if="list.length > 3" class="mt-5 flex w-full justify-center">
          <NuxtLink
            class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600"
            to="/projets"
          >
            Voir tous les projets
          </NuxtLink>
        </div>
      </ContentList>
    <h2 class="mt-10 mb-5 text-center font-display text-4xl/6 text-amber-400 lg:text-left lg:text-4xl">
        Mon blog s'installe ici
        <small class="font-sans text-base font-normal italic text-red-500">fini JauneAttitude.fr</small>
      </h2>
      <ContentList v-slot="{list}" :query="blogQuery">
        <div class="mb-2 grid grid-rows-4 gap-5 lg:grid-cols-4 lg:grid-rows-none">
          <nuxt-link
            v-for="blog in list"
            :key="blog.id"
            :to="`/blog/${blog.permalink}`"
            class="group relative aspect-square rounded-sm bg-amber-400/60"
          >
            <div
              class="absolute inset-0 z-10 bg-amber-400/10 transition-all group-hover:bg-amber-400/20 group-hover:backdrop-blur-none lg:bg-amber-400/30 lg:backdrop-blur-sm"
            />
            <nuxt-img
              :src="blog.image"
              sizes="xs:25vw lg:360px"
              format="webp"
              placeholder
              class="absolute inset-0 z-0 h-full"
            />
            <div class="absolute bottom-0 z-20 p-5">
              <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
                {{
                  blog.title
                }}
              </h4>
              <p v-if="blog.date">{{ moment(blog.date).format('ll') }}</p>
            </div>
          </nuxt-link>
        </div>
        <div class="mt-5 flex w-full justify-center">
          <NuxtLink
            class="font-bold bg-amber-400 p-3 text-black hover:text-amber-600"
            to="/blog"
          >
            C'est
            tout ?
          </NuxtLink>
        </div>
      </ContentList>
    </div>
    <div class="mt-8 flex flex-col gap-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-5 lg:pt-5">
      <h2 class="block font-display text-4xl/7 text-white lg:hidden lg:text-4xl">
        Ma dernière vidéo Youtube
        <small class="font-sans text-base italic text-red-500">On reste dans la verticalité.</small>
      </h2>
      <div class="aspect-portrait w-auto lg:h-screen">
        <iframe
          class="aspect-portrait w-full"
          src="https://www.youtube.com/embed?list=UULF4b9BIgf07NzGhrdL2zpQ8w"
        />
      </div>
      <div class="mt-4 flex flex-col justify-evenly lg:mt-0 lg:size-full">
        <h2 class="hidden font-display text-6xl/7 text-white lg:block">
          Ma dernière vidéo Youtube <br>
          <small class="font-sans text-base italic text-red-500">On reste dans la verticalité.</small>
        </h2>
        <div class="flex aspect-square flex-col gap-4 bg-amber-400/20 p-4 lg:ml-auto lg:mt-24 lg:self-end">
          <h2 class="font-display text-4xl text-white lg:text-right">
            Le podcast est toujours dispo
          </h2>
          <iframe class="h-full grow" src="https://pod.link/1369562721"/>
        </div>
      </div>
    </div>
    <p class="my-4 text-center font-sans text-base text-white lg:my-16">
      J'ai surement d'autres choses à rajouter mais je sèche… il est 4H du
      mat,
      je
      crois que
      c'est le
      moment de
      publier cette mise à jour
    </p>
  </div>
</template>

<script lang="ts" setup>
import {useHead} from 'unhead'
import moment from 'moment'
import type {QueryBuilderParams} from "@nuxt/content/types";

moment.locale('fr-FR')
const blogQuery: QueryBuilderParams = {
  path: "/blog",
  where: {draft: {$eq:false},}, limit: 4, sort: {date: -1}
}
const projectQuery: QueryBuilderParams = {
  path: "/projects",
  where: {draft: {$eq: false}}, limit: 4, sort: 
    {date: -1}
}
const description =
  "Rencontrez Macojaune, le photographe-entrepreneur-développeur méga curieux ! Ce personnage public jeune et dynamique est avide de découvertes et ne recule devant rien pour vivre pleinement sa vie. Avec ses compétences en photographie et en développement web, il vous emmène dans un univers fascinant où la créativité et la technologie se mêlent harmonieusement. Suivez ses aventures entrepreneuriales les plus folles et ses projets les plus étonnants sur son site. Et n'oubliez pas de le rejoindre sur les réseaux sociaux pour vivre l'expérience Macojaune à fond !"

useHead({
  title: 'Yellow art shop - La boutique du Macojaune',
  meta: [
    {
      name: 'title',
      content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'
    },
    {
      name: 'description',
      content: description
    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: 'https://macojaune.com/'},
    {property: 'og:title', content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'},
    {
      property: 'og:description',
      content: description
    },
    {property: 'og:image', content: '/pictures/dsc06261.jpg'},
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    {property: 'twitter:url', content: 'https://macojaune.com/'},
    {property: 'twitter:title', content: 'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'},
    {
      property: 'twitter:description',
      content: description
    },
    {property: 'twitter:image', content: 'https://macojaune.com/pictures/dsc06261.jpg'}
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: [
        {'@context': 'http://schema.org/'},
        {'@type': 'BreadcrumbList'},
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
