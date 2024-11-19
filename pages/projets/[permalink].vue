<template>
  <div class="w-full px-4">
    <div>
      <NuxtLink to="/projets" class="text-amber-400 hover:text-amber-600 text-sm">< Retour aux projets</NuxtLink>
      <h1 class="mb-4 font-display text-5xl uppercase text-amber-600 lg:mb-3 lg:text-7xl">
        <!--        <small class="text-white text-xs font-sans normal-case">Nom de code :</small>-->
        {{ data?.title ?? "" }}
      </h1>
      <div class="w-full">
        <ContentRenderer v-if="data" class="text-white lg:max-w-5xl" :value="data"/>
        <div v-if="data?.pinterestUrl" class="my-4 lg:my-8">
          <h3 class="font-display text-2xl text-amber-400 mb-3 lg:text-3xl">Le Petit 
          Moodboard   <small class="font-sans text-base font-normal italic text-red-500">pour la 
              route</small></h3>
          <a
data-pin-do="embedBoard" 
                                                                       data-pin-scale-height="240"
                data-pin-scale-width="220" :href="data?.pinterestUrl"/></div>
      </div>
    </div>
    <div class="mt-8 bg-stone-900/50 p-5">
      <h3 class="font-display my-2 text-2xl text-amber-400 lg:my-3 lg:text-3xl">
        Je veux participer, comment on fait
        ?
      </h3>
      <p class="text-xl text-white">
        Très simple, accorde-moi 24 secondes (et demi) pour remplir ce court formulaire et c'est parti !
        <span
          class="text-sm italic text-orange-500"
        >(ou
          klaxonne
          moi dans la
          rue)</span>
      </p>
      <iframe
        data-tally-src="https://tally.so/embed/n0MpAj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        loading="lazy" width="100%" height="638" frameborder="0" marginheight="0" marginwidth="0"
        title="Participer à un Projet Photo avec Macojaune"/>
    </div>
  </div>
</template>

<script setup lang="ts">
const {path, params} = useRoute()
const {data} = await useAsyncData('get-document', () =>
  queryContent('/projects').where({permalink: `${params?.permalink}`}).findOne())

const title = data.value?.title ? `${data.value?.title} | Projets photo du Macojaune` : 'Le site du Macojaune'
useHead({
  title,
  meta: [
    {
      name: 'title',
      content: title
    },
    {
      name: 'description',
      content: data.value?.description

    },
    {property: 'og:type', content: 'website'},
    {property: 'og:url', content: `https://macojaune.com${path}`},
    {property: 'og:title', content: title},
    {
      property: 'og:description',
      content: data.value?.description
    },
    {property: 'og:image', content: `https://macojaune.com/${data.value?.image}`},
    {
      property: 'twitter:card', content: 'summary_large_image'
    },
    {property: 'twitter:url', content: `https://macojaune.com${path}`},
    {property: 'twitter:title', content: title + ' | Le blog du Macojaune'},
    {
      property: 'twitter:description',
      content: data.value?.description
    },
    {property: 'twitter:image', content: `https://macojaune.com/${data.value?.image}`}
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'http://schema.org/',
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
              '@id': 'https://macojaune.com/projets/',
              name: "Projets"
            }
          }, {
            '@type': 'ListItem',
            position: 3,
            item: {
              '@id': 'https://macojaune.com/projets/' + params.permalink,
              name: params.permalink
            }
          }
        ]
      })
    },
    {type: 'text/javascript', src: "https://tally.so/widgets/embed.js", async: true, defer: true},
    // {type: 'text/javascript', src: "//assets.pinterest.com/js/pinit.js", async: true, defer: true, tagPosition:"bodyClose"},
    {
      type: 'text/javascript',
      innerHTML: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`
    }
  ]
})
onMounted(() => {
  Tally.loadEmbeds();
  // Load Pinterest board embed
  (function (d) {
     const f = d.getElementsByTagName('SCRIPT')[0],
       p = d.createElement('SCRIPT');
     p.type = 'text/javascript';
     p.async = true;
     p.src = '//assets.pinterest.com/js/pinit.js';
     f.parentNode.insertBefore(p, f);
   })(document);
})
</script>

