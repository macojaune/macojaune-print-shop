<template>
  <div class=" relative w-full px-4">
    <div class="flex flex-row justify-around">
      <section class="lg:w-1/4">
        <h2 class="font-display text-3xl text-amber-600 lg:mb-2">
          Selon notre ami CHATGPT:
        </h2>
        <p class="text-right text-white">
          Macojaune est un personnage public jeune et dynamique, passionné par la vie, la
          photographie et l'entrepreneuriat. Il est connu pour ses talents de photographe et ses compétences en
          développement web, ainsi que pour son parcours et sa personnalité atypique. Macojaune partage
          régulièrement son travail et ses projets sur les réseaux sociaux et son site internet, où il vend également
          des
          tirages de ses clichés.
        </p>
      </section>
      <section class="lg:w-2/4">
        <h2 class="font-display text-3xl text-amber-400 lg:mb-2">
          Selon moi…
        </h2>
        <p class="text-lg text-white">
          C'est plutôt juste, oui ? Assez bluffé je suis. Bon, d'accord… <br>
          Poster
          régulièrement sur son site internet c'est pas spécialement vrai. Si tu lis ceci, c'est que j'ai
          publié cette mise à jour tant repoussée et que je tente d'organiser un fonctionnement cool et dynamique par
          ici.
        </p>
        <div
          class="group rounded-sm bg-amber-400/20 transition-all ease-in hover:bg-amber-400/40 lg:mt-5 lg:p-5"
        >
          <h3 class="font-display text-4xl text-white lg:mb-2">
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
            emplacement ! Pour découvrir ma sélection de tirages et ajouter une touche de créativité à ton salon
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
    <div class="lg:pt-4">
      <p class="text-white">
        On continue avec les nouveautés
      </p>
      <h2 class="font-display text-4xl text-amber-400 lg:mb-3">
        Mon blog s'installe ici
        <small class="font-sans text-base italic text-red-500">fini JauneAttitude.fr</small>
      </h2>
      <ContentList v-slot="{list}" path="/blog">
        <div class="lg:mb-2 lg:grid lg:grid-cols-4 lg:gap-5">
          <nuxt-link
            v-for="blog in list.slice(state.nbToShow).reverse()"
            :key="blog.id"
            :to="`/blog/${blog.permalink}`"
            class="group relative aspect-square rounded-sm bg-amber-400/60 "
          >
            <div
              class="absolute inset-0 z-10 bg-amber-400/30 backdrop-blur-sm transition-all group-hover:bg-amber-400/10 group-hover:backdrop-blur-none"
            />
            <nuxt-img
              :src="`/pictures${blog.image}`"
              fit="cover"
              placeholder
              class="absolute inset-0 z-0 h-full"
            />
            <div class="absolute bottom-0 z-20 lg:p-5">
              <h4 class=" font-display  text-4xl text-white group-hover:text-amber-600">
                {{
                  blog.title
                }}
              </h4>
              <p>{{ moment(blog.date).format('ll') }}</p>
            </div>
          </nuxt-link>
        </div>
        <div class="mt-5 flex w-full justify-center">
          <button
            v-if="state.nbToShow>=-list.length"
            class=" bg-amber-400 p-3 text-black hover:text-amber-600"
            @click="showMore"
          >
            C'est
            tout ?
          </button>
        </div>
      </ContentList>
    </div>

    <div class="flex flex-row items-center lg:gap-5 lg:pt-5">
      <div class="lg:aspect-portrait lg:h-screen lg:w-auto">
        <iframe
          class="lg:aspect-portrait lg:w-full"
          src="https://www.youtube.com/embed?list=UULF4b9BIgf07NzGhrdL2zpQ8w"
        />
      </div>
      <div class="flex flex-col justify-evenly lg:h-full lg:w-full">
        <h2 class="font-display text-6xl/7 text-white">
          Ma dernière vidéo Youtube <br>
          <small class="font-sans text-base italic text-red-500">On reste dans la verticalité.</small>
        </h2>
        <div class="flex flex-col self-end bg-amber-400/20 lg:ml-auto lg:mt-24 lg:aspect-square lg:gap-4 lg:p-4">
          <h2 class="font-display text-right text-4xl text-white">
            Le podcast est dispo juste là
          </h2>
          <iframe class="h-full grow" src="https://pod.link/1369562721" />
        </div>
      </div>
    </div>
    <p class="my-16 text-center font-sans text-base text-white">
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
import { useHead } from 'unhead'
import moment from 'moment'
import { reactive } from 'vue'

moment.locale('fr-FR')
const state = reactive({ nbToShow: -4 })

function showMore () {
  state.nbToShow -= 8
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
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/' },
    { property: 'og:title', content: 'YELLOW ART SHOP' },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: '/pictures/dsc06261.jpg' },
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/' },
    { property: 'twitter:title', content: 'YELLOW ART SHOP' },
    {
      property: 'twitter:description',
      content: description
    },
    { property: 'twitter:image', content: 'https://macojaune.com/pictures/dsc06261.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: [
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
