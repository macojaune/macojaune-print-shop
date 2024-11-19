<template>
  <div class="relative w-full px-4 text-white">
    <div class="flex flex-col gap-5 lg:flex-row lg:justify-around">
      <section>
        <h1 class="font-display text-4xl text-amber-300 mb-3">À propos</h1>
        <prose-p>Macojaune est un grand curieux et touche à tout, sa passion pour la Beauté l'attire vers la 
          photographie, médium qui lui permet de retranscrire et partager sa vision du monde de la plus simple des manières, un instant à la fois.
                      <br><br>
        Ses clichés se battent contre ceux de nos sociétés et vont souligner, sans retouches, ce que le commun des mortels appelle: défauts.
        Les mettre en lumière, les rendre acceptables, digestes, beaux. 
          <br><br>
        
        Il commence d’abord par partager ses travaux sur les réseaux sociaux, utilisant ses talents d’écriture à chaque publication pour partager une histoire. 
        Il invite son audience à s’y plonger, interroger leur ressenti et parfois même y participer sous forme de cadavres exquis.
          <br><br>
        Cette présence sur les réseaux, lui permettent de collaborer avec d’autres artistes. En 2018, il participe au projet “Fanm Kréyòl” de Tessa Naime, écrivaine guadeloupéenne, un de ses clichés fera la couverture de
        l’ouvrage “Lettre ouverte à la femme créole”.
        C’est ensuite en collaboration avec l’auteur Timalo et la photographe Anaïs C. qu’il travaillera sur la couverture du roman créole “Channda”, suite de la collection “Dyablès”, sorti en 2019.
          <br><br>
        En 2022, il participe à sa première exposition en Guadeloupe intitulée, “Salon Français” à l’hôtel ARAWAK, dans le cadre de la Route du Rhum.
          <br><br>
        Il contribue à l’édition n°5 de la revue haïtienne Do-Kre-I-S et quelques mois plus tard, une de ses photos fait la couverture du recueil de poésie intitulé “Au berceau des lendemains”, écrit par Ernest Pépin.
          <br><br>
        En 2023, un de ces écrits sera publié dans la revue NEG pour sa 3ème parution.
          <br><br>
        L’année 2024 débutera avec une publication dans la revue Do-Kre-I-S n°6 en collaboration photo/texte avec Tessa Naime, projet qui sera exposé en Avril à la Galerie Emergenc’Art en Guadeloupe.
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
import { useHead } from 'unhead'
const description = 'À propos de Macojaune, expositions collectives et publications artistiques'
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
    { property: 'og:url', content: 'https://macojaune.com/' },
    {
      property: 'og:title',
      content:
        'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'
    },
    {
      property: 'og:description',
      content: description
    },
    { property: 'og:image', content: '/pictures/dsc06261.jpg' },
    {
      property: 'twitter:card',
      content: 'summary_large_image'
    },
    { property: 'twitter:url', content: 'https://macojaune.com/' },
    {
      property: 'twitter:title',
      content:
        'Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux'
    },
    {
      property: 'twitter:description',
      content: description
    },
    {
      property: 'twitter:image',
      content: 'https://macojaune.com/pictures/dsc06261.jpg'
    }
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
            },
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@id': 'https://macojaune.com/a-propos',
                name: 'À propos'
              }
            }
          ]
        }
      ]
    }
  ]
})
</script>
