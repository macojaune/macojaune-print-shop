<template>
  <div class="w-full px-4 py-6 lg:px-6 lg:py-8">
    <div class="mx-auto max-w-[1500px]">
      <header class="grid gap-8 border-b border-amber-200/10 pb-10 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-14">
        <div class="lg:col-span-8">
          <NuxtLink
            to="/projets"
            class="inline-flex w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
          >
            Retour aux projets
          </NuxtLink>
          <h1 class="mt-5 max-w-[11ch] font-display text-5xl uppercase leading-[0.84] text-amber-400 lg:text-[6.2rem]">
            {{ data?.title ?? "" }}
          </h1>
        </div>

        <div class="lg:col-span-4 lg:pb-2">
          <p v-if="data?.description" class="max-w-[30ch] text-base leading-7 text-stone-300">
            {{ data.description }}
          </p>
        </div>
      </header>

      <div class="grid gap-12 pt-10 lg:grid-cols-12 lg:gap-14 lg:pt-14">
        <article class="project-content lg:col-span-8">
          <ContentRenderer v-if="data" :value="data" />

          <section v-if="data?.pinterestUrl" class="mt-12 space-y-4 lg:mt-16">
            <div class="max-w-[42rem]">
              <h2 class="font-display text-3xl leading-none text-amber-400 lg:text-4xl">
                Le petit moodboard
              </h2>
              <p class="mt-2 text-sm leading-6 text-stone-300">
                Quelques images pour prolonger l'idée avant de passer à l'action.
              </p>
            </div>

            <div class="overflow-hidden bg-stone-950/55 p-3 lg:p-4">
              <a
                data-pin-do="embedBoard"
                data-pin-scale-height="240"
                data-pin-scale-width="220"
                :href="data?.pinterestUrl"
              />
            </div>
          </section>
        </article>

        <aside class="lg:col-span-4">
          <div class="sticky top-24 space-y-5 bg-stone-950/60 p-5 lg:p-6">
            <div>
              <p class="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
                Participation
              </p>
              <h2 class="mt-3 font-display text-3xl leading-[0.92] text-white lg:text-[2.5rem]">
                Je veux participer
              </h2>
            </div>

            <p class="max-w-[28ch] text-base leading-7 text-stone-200">
              Très simple, accorde-moi 24 secondes et demi pour remplir ce court formulaire et c&apos;est parti.
            </p>

            <p class="text-sm italic leading-6 text-amber-300/75">
              Ou klaxonne-moi dans la rue.
            </p>

            <iframe
              data-tally-src="https://tally.so/embed/n0MpAj?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="638"
              frameborder="0"
              marginheight="0"
              marginwidth="0"
              title="Participer à un Projet Photo avec Macojaune"
              class="min-h-[638px] bg-transparent"
            />
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toAssetUrl, toSiteUrl } = useAssetUrls()

const { path, params } = useRoute()
const requestKey = computed(() => `project-document:${String(params?.permalink ?? "")}`)
const { data } = await useAsyncData(requestKey, () =>
  queryContent("/projects").where({ permalink: `${params?.permalink}` }).findOne(),
)

const title = data.value?.title ? `${data.value?.title} | Projets photo du Macojaune` : "Le site du Macojaune"
useHead({
  title,
  meta: [
    {
      name: "title",
      content: title,
    },
    {
      name: "description",
      content: data.value?.description,

    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: toSiteUrl(path) },
    { property: "og:title", content: title },
    {
      property: "og:description",
      content: data.value?.description,
    },
    { property: "og:image", content: toAssetUrl(data.value?.image) },
    {
      property: "twitter:card", content: "summary_large_image",
    },
    { property: "twitter:url", content: toSiteUrl(path) },
    { property: "twitter:title", content: `${title} | Le blog du Macojaune` },
    {
      property: "twitter:description",
      content: data.value?.description,
    },
    { property: "twitter:image", content: toAssetUrl(data.value?.image) },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "http://schema.org/",
        "@type": "BreadcrumbList",

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: {
              "@id": "https://macojaune.com",
              name: "Homepage",
            },
          },
          {
            "@type": "ListItem",
            position: 2,
            item: {
              "@id": "https://macojaune.com/projets/",
              name: "Projets",
            },
          }, {
            "@type": "ListItem",
            position: 3,
            item: {
              "@id": `https://macojaune.com/projets/${params.permalink}`,
              name: params.permalink,
            },
          },
        ],
      }),
    },
    { type: "text/javascript", src: "https://tally.so/widgets/embed.js", async: true, defer: true },
    {
      type: "text/javascript",
      innerHTML: `var d=document,w="https://tally.so/widgets/embed.js",v=function(){"undefined"!=typeof Tally?Tally.loadEmbeds():d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((function(e){e.src=e.dataset.tallySrc}))};if("undefined"!=typeof Tally)v();else if(d.querySelector('script[src="'+w+'"]')==null){var s=d.createElement("script");s.src=w,s.onload=v,s.onerror=v,d.body.appendChild(s);}`,
    },
  ],
})
onMounted(() => {
  Tally.loadEmbeds()
  ;(function (d) {
    const f = d.getElementsByTagName("SCRIPT")[0]
    const p = d.createElement("SCRIPT")
    p.type = "text/javascript"
    p.async = true
    p.src = "//assets.pinterest.com/js/pinit.js"
    f.parentNode.insertBefore(p, f)
  })(document)
})
</script>

<style scoped>
.project-content {
  max-width: 68ch;
  color: rgb(245 245 244);
}

.project-content :deep(h2) {
  margin-top: 3.5rem;
  margin-bottom: 1rem;
  font-family: var(--font-display, inherit);
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 0.94;
  color: rgb(251 191 36);
}

.project-content :deep(h3) {
  margin-top: 2.25rem;
  margin-bottom: 0.75rem;
  font-family: var(--font-display, inherit);
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 0.96;
  color: rgb(255 251 235);
}

.project-content :deep(p),
.project-content :deep(li) {
  font-size: 1.05rem;
  line-height: 1.85;
  color: rgb(231 229 228);
}

.project-content :deep(p + p) {
  margin-top: 1.2rem;
}

.project-content :deep(ul),
.project-content :deep(ol) {
  margin-top: 1.25rem;
  padding-left: 1.25rem;
}

.project-content :deep(a) {
  color: rgb(252 211 77);
  text-decoration: none;
}

.project-content :deep(a:hover) {
  color: rgb(253 230 138);
}

.project-content :deep(blockquote) {
  margin-top: 2rem;
  padding-left: 1rem;
  border-left: 1px solid rgb(251 191 36 / 0.35);
  color: rgb(214 211 209);
}
</style>
