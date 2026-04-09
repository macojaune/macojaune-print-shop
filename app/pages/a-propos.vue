<template>
  <div class="relative w-full px-4 text-white">
    <div class="flex flex-col gap-5 lg:flex-row lg:justify-around">
      <section>
        <h1 class="font-display text-4xl text-amber-300 mb-3">À propos</h1>
        <prose-p>Je suis un grand curieux, un touche-à-tout. Ma passion pour la Beauté m’a naturellement conduit vers la photographie, un médium qui me permet de retranscrire et de partager ma vision du monde, simplement, un instant à la fois.
          <br><br>
        Mes clichés questionnent nos standards et mettent en lumière, sans retouche, ce que l’on appelle souvent des “défauts”. Mon intention est de les rendre visibles, acceptables, digestes, beaux.
          <br><br>

        J’ai d’abord partagé mon travail sur les réseaux sociaux, en y ajoutant à chaque fois de l’écriture pour raconter une histoire. J’invite mon audience à s’y plonger, à interroger son ressenti, et parfois même à participer sous forme de cadavres exquis.
          <br><br>
        Cette présence m’a permis de collaborer avec d’autres artistes. En 2018, j’ai participé au projet “Fanm Kréyòl” de Tessa Naime, écrivaine guadeloupéenne. L’un de mes clichés a ensuite fait la couverture de l’ouvrage “Lettre ouverte à la femme créole”.
        Puis, en collaboration avec l’auteur Timalo et la photographe Anaïs C., j’ai travaillé sur la couverture du roman créole “Channda”, suite de la collection “Dyablès”, sorti en 2019.
          <br><br>
        En 2022, j’ai participé à ma première exposition en Guadeloupe, “Salon Français”, à l’hôtel ARAWAK, dans le cadre de la Route du Rhum.
          <br><br>
        J’ai contribué à l’édition n°5 de la revue haïtienne Do-Kre-I-S, et quelques mois plus tard, l’une de mes photos a fait la couverture du recueil de poésie “Au berceau des lendemains”, écrit par Ernest Pépin.
          <br><br>
        En 2023, l’un de mes textes a été publié dans la revue NEG pour sa 3ème parution.
          <br><br>
        En 2024, j’ai publié dans la revue Do-Kre-I-S n°6 en collaboration photo/texte avec Tessa Naime, un projet également exposé en avril à la Galerie Emergenc’Art en Guadeloupe.
          <br><br>
        En 2025, j’ai traversé un hiatus nécessaire : pause sur les réseaux sociaux, vie pro et sociale au ralenti, et très peu de sorties de l’appareil photo.
          <br><br>
        En 2026… peut-être le retour ?
        </prose-p>
      </section>
      <section class="">
        <h2 class="font-display text-4xl text-amber-300 mb-3">Expositions collectives</h2>
        <ul>
          <li>
            <b class="text-orange-400">21 Juin - 26 Juillet 2024</b> — "Chaque jour qui pousse nait dans la nuit", Galerie
            Boutique U.K.A, Marina de Pointe-à-Pitre
          </li> 
          <li>
            <b class="text-orange-400">30 Mai 2024</b> — Soirée Ruinart, Fort fleur d'épée, Gosier
          </li> 
          <li>
            <b class="text-orange-400">25 avril - 1er mai 2024</b> — Corpuscules, exposition
            collective Capsule, Lancement DOKRE.I.S. Galerie
            Emergenc’Art
          </li>

          <li>
            <b class="text-orange-400">7 - 15 novembre 2022</b> — Salon Français, exposition
            d’art contemporain Arawak Beach Resort, Pavillon
            ART+RHUM
          </li>
        </ul>
        <h2 class="my-3 font-display text-4xl text-amber-300">Publications artistiques</h2>
        <ul>
          <li>
            <a target="_blank" class="text-orange-400 hover:text-amber-300" href="https://www.associationvagueslitteraires.org/revue-dokreis">DOKRE.I.S #6</a> Fragments / Mòso en collaboration avec
            <a href="https://tessanaime.fr" target="_blank" class="text-amber-400 hover:text-amber-600">Tessa Naime</a>
          </li>
          <li>
            <a
class="text-orange-400 hover:text-amber-300"
              href="https://www.calameo.com/books/006255475d8f8ef49b8aa"
              target="_blank"
            >NEG #3</a> Rap Poézi Poilitik 
          </li>
          <li><a
target="_blank" class="text-orange-400 hover:text-amber-300" 
                 href="https://www.associationvagueslitteraires.org/revue-dokreis">DOKRE.I.S #5</a> Fête / Fèt</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { buildSiteOgImagePath } from '../utils/og-images'

const description = 'À propos de Macojaune, expositions collectives et publications artistiques'
const socialImage = `https://macojaune.com${buildSiteOgImagePath({
  title: 'À propos',
  eyebrow: 'Macojaune',
  description,
  image: '/pictures/dsc06261.jpg'
})}`
useHead({
  title: 'Macojaune - À propos',
  meta: [
    {
      name: 'title',
      content: 'Macojaune - À propos'
    },
    {
      name: 'description',
      content:
        'À propos de Macojaune, expositions collectives et publications artistiques'
    },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://macojaune.com/a-propos' },
    {
      property: 'og:title',
      content: 'Macojaune | À propos'
    },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: socialImage },
    {
      property: 'twitter:card',
      content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/a-propos' },
    {
      property: 'twitter:title',
      content: 'Macojaune | À propos'
    },
    {
      property: 'twitter:description',
      content: description
    },
    {
      property: 'twitter:image',
      content: socialImage
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://macojaune.com/a-propos'
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
          },
          {
            '@type': 'ListItem',
            position: 2,
            item: {
              '@id': 'https://macojaune.com/a-propos',
              name: 'À propos'
            }
          }
        ]
      })
    }
  ]
})
</script>
