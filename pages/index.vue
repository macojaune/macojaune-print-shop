<template lang="pug">
.homepage.px-4
  ContentList(v-slot="{list}" path="/runs" )
    .list.runs.flex.flex-col-reverse.gap-12
      .run(v-for="run in list" :key="run._path" class="flex flex-col lg:flex-row justify-between items-between")
        .run-text(class="basis-full lg:basis-2/4 mt-3 lg:mt-0  order-2 lg:order-1")
          small.run-date.text-white {{formatDate(run.date)}}
          br
          NuxtLink.mb-2.uppercase.text-amber-400.font-display(class="text-4xl lg:text-7xl hover:text-orange-600" :to="`/series/${run.slug}/`") {{run.title}}
          p.run-description.text-white {{run.description}}
        .run-pictures.flex.gap-3(class="basis-full lg:basis-2/5 order-1 lg:order-2")
          .run-picture.grow(v-for="(product, index) in run.products.slice(0,3)" :key="index" class="hover:scale-150 hover:rounded-none transition-all ease-in-out")
            NuxtLink.h-full(:to="`/series/${run.slug}/${product.slug}`")
              img.rounded-md.h-full.w-full(v-if="product.images.length>0" :src="`/pictures${product.images[0]}`" sizes="sm:100vw" loading="lazy" quality="60")
              span.white--text(v-else) {{product.title}}
      //template(#not-found)
      //  .empty
      //    h3.text-center.warning--text Oups ! Pas de série disponible à la vente.
</template>

<script lang="ts" setup>
import moment from "moment";
moment.locale("fr-FR");
useHead({
  script: [
    {
      type: "application/ld+json",
      children: [
        { "@context": "http://schema.org/" },
        { "@type": "BreadcrumbList" },
        {
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              item: {
                "@id": "https://macojaune.com",
                name: "Homepage",
              },
            },
          ],
        },
      ],
    },
  ],
});
const formatDate = (date: string) => moment(date).format("ll");
</script>
