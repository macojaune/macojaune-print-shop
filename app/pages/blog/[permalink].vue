<template>
  <div class="w-full px-4 py-6 lg:px-6 lg:py-8">
    <div class="mx-auto max-w-[1450px]">
      <header class="grid gap-8 border-b border-amber-200/10 pb-10 lg:grid-cols-12 lg:gap-10 lg:pb-14">
        <div :class="data?.image ? 'lg:col-span-6 lg:self-end' : 'lg:col-span-8'">
          <NuxtLink
            to="/blog"
            class="inline-flex w-fit items-center py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200"
          >
            Retour au blog
          </NuxtLink>
          <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.32em] text-amber-300/72">
            <span v-if="data?.date">{{ moment(data.date).format("LL") }}</span>
            <span v-if="data?.author">{{ data.author }}</span>
            <span v-if="data?.categories?.length">{{ data.categories[0] }}</span>
          </div>
          <h1
            :style="{ viewTransitionName: data?.permalink ? `blog-${data.permalink}` : '' }"
            class="mt-5 max-w-[12ch] font-display text-5xl leading-[0.84] text-amber-400 lg:text-[6rem]"
          >
            {{ data?.title ?? "" }}
          </h1>
          <p v-if="data?.description" class="max-w-[30ch] text-base leading-7 text-stone-300">
            {{ data.description }}
          </p>
        </div>

        <figure v-if="data?.image" class="overflow-hidden bg-stone-950 lg:col-span-5 lg:col-start-8">
          <nuxt-img
            :src="toAssetUrl(data.image)"
            :alt="data?.title ?? ''"
            format="webp"
            placeholder
            sizes="(max-width: 1023px) 100vw, 42vw"
            class="aspect-[4/5] w-full object-cover"
          />
        </figure>
      </header>

      <div class="pt-10 lg:pt-14">
        <div class="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <aside class="hidden lg:col-span-2 lg:block">
            <div class="sticky top-24 space-y-5">
              <div v-if="data?.tags?.length">
                <p class="text-[11px] uppercase tracking-[0.3em] text-amber-300/65">
                  Tags
                </p>
                <div class="mt-3 flex flex-col gap-2">
                  <span
                    v-for="tag in data.tags.slice(0, 4)"
                    :key="tag"
                    class="text-sm leading-6 text-stone-400"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div class="blog-content-shell lg:col-span-8">
            <article class="blog-content">
              <ContentRenderer v-if="data" :value="data" />
            </article>
          </div>
        </div>
      </div>

      <div v-if="nextPost" class="mt-12 border-t border-amber-200/10 pt-8 lg:mt-16 lg:pt-10">
        <nuxt-link :href="`/blog/${nextPost.permalink}`" class="group flex w-full flex-col gap-2 lg:max-w-[38rem] lg:ml-auto lg:text-right">
          <span class="text-[11px] uppercase tracking-[0.3em] text-amber-300/70">
            {{ nextPost?.title?.toLowerCase().startsWith('[projet]') ? 'Projet suivant' : "Article suivant" }}
          </span>
          <span class="font-display text-3xl leading-[0.92] text-white transition group-hover:text-amber-200 lg:text-[2.6rem]">
            {{ nextPost.title }}
          </span>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from "moment/moment"

const { toAssetUrl, toSiteUrl } = useAssetUrls()

const { path, params } = useRoute()
const requestKey = computed(() => `blog-document:${String(params?.permalink ?? "")}`)
const { data } = await useAsyncData(requestKey, () =>
  queryContent("/blog").where({ permalink: `${params?.permalink}` }).findOne(),
)
const nextPost = await queryContent("/blog").where({ date: { $lt: data.value?.date } }).sort({ _id: -1 }).findOne()

const title = data.value?.title ? `${data.value?.title} | Le blog du Macojaune` : "Le blog du Macojaune"
useHead({
  title,
  meta: [
    {
      name: "title",
      content: `${title} | Le blog du Macojaune`,
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
              "@id": "https://macojaune.com/blog/",
              name: "Blog",
            },
          }, {
            "@type": "ListItem",
            position: 3,
            item: {
              "@id": `https://macojaune.com/blog/${params.permalink}`,
              name: params.permalink,
            },
          },
        ],
      }),
    },
  ],
})
</script>

<style scoped>
.blog-content {
  max-width: 68ch;
  margin-inline: auto;
  color: rgb(245 245 244);
}

.blog-content-shell {
  position: relative;
}

.blog-content-shell::before {
  content: "";
  position: absolute;
  inset: -1.5rem 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, rgb(251 191 36 / 0), rgb(251 191 36 / 0.28), rgb(251 191 36 / 0));
}

.blog-content :deep(h1) {
  display: none;
}

.blog-content :deep(h2) {
  margin-top: 3.75rem;
  margin-bottom: 1rem;
  font-family: var(--font-display, inherit);
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 0.94;
  color: rgb(251 191 36);
}

.blog-content :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 0.85rem;
  font-family: var(--font-display, inherit);
  font-size: clamp(1.55rem, 2vw, 2.1rem);
  line-height: 0.98;
  color: rgb(255 251 235);
}

.blog-content :deep(p),
.blog-content :deep(li) {
  font-size: 1.1rem;
  line-height: 1.95;
  color: rgb(231 229 228);
}

.blog-content :deep(p:first-of-type) {
  font-size: clamp(1.25rem, 1.6vw, 1.55rem);
  line-height: 1.65;
  color: rgb(245 245 244);
}

@media (min-width: 1024px) {
  .blog-content :deep(p:first-of-type)::first-letter {
    float: left;
    margin-right: 0.12em;
    margin-top: 0.08em;
    font-family: var(--font-display, inherit);
    font-size: 4.8rem;
    line-height: 0.8;
    color: rgb(251 191 36);
  }
}

.blog-content :deep(p + p) {
  margin-top: 1.25rem;
}

.blog-content :deep(iframe) {
  width: 100%;
  margin-top: 1.75rem;
}

.blog-content :deep(ul),
.blog-content :deep(ol) {
  margin-top: 1.25rem;
  padding-left: 1.25rem;
}

.blog-content :deep(a) {
  color: rgb(252 211 77);
  text-decoration-line: underline;
  text-decoration-color: rgb(251 191 36 / 0.35);
  text-underline-offset: 0.18em;
}

.blog-content :deep(a:hover) {
  color: rgb(253 230 138);
  text-decoration-color: rgb(253 230 138 / 0.55);
}

.blog-content :deep(blockquote) {
  margin-top: 2rem;
  padding-left: 1rem;
  border-left: 1px solid rgb(251 191 36 / 0.35);
  color: rgb(214 211 209);
  font-size: 1rem;
  line-height: 1.8;
}

.blog-content :deep(img) {
  margin-top: 2rem;
  width: 100%;
  object-fit: cover;
}

.blog-content :deep(figure) {
  margin-top: 2.5rem;
}

.blog-content :deep(code) {
  color: rgb(253 230 138);
}

.blog-content :deep(hr) {
  margin-top: 3rem;
  border-color: rgb(251 191 36 / 0.15);
}
</style>
