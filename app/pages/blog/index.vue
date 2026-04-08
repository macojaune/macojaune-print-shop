<template>
  <div class="w-full px-4 py-6 lg:px-6 lg:py-8">
    <div class="mx-auto max-w-[1680px]">
      <section class="mb-10 border-b border-amber-200/10 pb-10 lg:mb-14 lg:pb-14">
        <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/70">
          Journal de bord
        </p>
        <h1 class="mt-3 max-w-[12ch] font-display text-5xl uppercase leading-[0.92] text-amber-300 sm:text-6xl lg:text-7xl">
          Le blog du Macojaune
        </h1>
        <p class="mt-5 max-w-[52ch] text-base leading-7 text-stone-300 lg:text-lg lg:leading-8">
          Pensées, apprentissages, détours créatifs et morceaux de vie. Entre photo, écriture et expérimentation.
        </p>
      </section>

      <div
        v-if="list?.length"
        class="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(9rem,_1fr)]"
      >
        <NuxtLink
          v-for="(blog, index) in list"
          :key="blog.permalink"
          :to="`/blog/${blog.permalink}`"
          :class="[blogCardClass(index), blogCardToneClass(index)]"
          :style="{ viewTransitionName: `blog-${blog.permalink}` }"
          class="group relative overflow-hidden border border-white/10 bg-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          data-umami-event="BlogClick"
          data-umami-section="blog_grid"
          :data-umami-label="blog.title"
          :data-umami-position="index + 1"
          data-umami-content-type="blog"
          :data-umami-content-slug="blog.permalink"
          data-umami-surface="blog_index"
        >
          <template v-if="blog.image">
            <NuxtImg
              :src="toAssetUrl(blog.image)"
              :alt="blog.title"
              format="webp"
              placeholder
              :sizes="blogImageSizes(index)"
              :style="{ viewTransitionName: `img-${blog.permalink}` }"
              class="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div class="absolute inset-0 bg-black/28" />
            <div class="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.52),rgba(0,0,0,0.22)_48%,rgba(0,0,0,0.52))]" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/66 to-black/46" />
          </template>

          <template v-else>
            <div class="absolute inset-0 bg-[linear-gradient(145deg,rgba(18,18,22,0.98),rgba(9,9,12,1))]" />
            <div class="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.15),transparent_70%)]" />
          </template>

          <div class="relative z-10 flex h-full flex-col justify-between p-5 lg:p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <p class="text-[10px] uppercase tracking-[0.34em] text-amber-300/76">
                  {{ blog.label }}
                </p>
                <p class="text-[10px] uppercase tracking-[0.22em] text-stone-300/72">
                  {{ blogCardFormat(index, blog.label) }}
                </p>
              </div>
              <p
                v-if="blog.date"
                class="text-[10px] uppercase tracking-[0.28em] text-stone-300/72"
              >
                {{ formatCardDate(blog.date) }}
              </p>
            </div>

            <div>
              <h2
                :class="blogCardTitleClass(index)"
                class="text-balance text-white transition duration-300 group-hover:text-amber-100"
              >
                {{ blog.title }}
              </h2>
              <p
                v-if="blog.excerpt"
                :class="blogCardExcerptClass(index)"
                class="mt-4 text-stone-200/90"
              >
                {{ blog.excerpt }}
              </p>
              <div class="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-amber-200">
                <span>Lire</span>
                <span aria-hidden="true" class="transition duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div
        v-else
        class="border border-white/10 bg-stone-950/80 px-6 py-10 text-sm text-stone-300"
      >
        Les articles arrivent bientôt.
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getBlogEntries } from "../../composables/useContentCollections"

const { toAssetUrl } = useAssetUrls()
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" })

type BlogItem = Awaited<ReturnType<typeof getBlogEntries>>[number]

type BlogCard = {
  date?: string | null
  excerpt: string
  image?: string
  label: string
  permalink: string
  title: string
}

const normalizeTagList = (value: unknown) =>
  Array.isArray(value)
    ? value.map((entry) => String(entry || "").trim()).filter(Boolean)
    : []

const extractTextNodes = (value: unknown, output: string[]) => {
  if (!value) {
    return
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed) {
      output.push(trimmed)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => extractTextNodes(entry, output))
    return
  }

  if (typeof value === "object") {
    Object.values(value as Record<string, unknown>).forEach((entry) => extractTextNodes(entry, output))
  }
}

const truncateText = (value: string, maxLength = 170) => {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (!normalized) {
    return ""
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return normalized.slice(0, maxLength).trimEnd() + "…"
}

const pickExcerpt = (entry: Record<string, unknown>) => {
  if (typeof entry.description === "string" && entry.description.trim()) {
    return truncateText(entry.description)
  }

  const chunks: string[] = []
  extractTextNodes(entry.body, chunks)

  const merged = chunks
    .filter((chunk) => chunk.length > 20 && !chunk.startsWith("http"))
    .join(" ")

  return truncateText(merged)
}

const getBlogLabel = (entry: BlogItem) => {
  const categories = normalizeTagList(entry.categories).map((value) => value.toLowerCase())
  const tags = normalizeTagList(entry.tags).map((value) => value.toLowerCase())
  const title = String(entry.title || "").toLowerCase()

  if (Boolean(entry.podcast) || categories.includes("podcast")) {
    return "Podcast"
  }

  if (title.startsWith("[projet]") || categories.includes("projet")) {
    return "Projet"
  }

  if (tags.some((tag) => ["développement", "developpement", "business", "tech", "web", "developer"].includes(tag))) {
    return "Réflexion"
  }

  return "Article"
}

const { data: list } = await useAsyncData<BlogCard[]>("blog-list-v2", async () =>
  (await getBlogEntries())
    .filter((entry) => Boolean(entry.permalink) && Boolean(entry.title))
    .map((entry) => ({
      date: typeof entry.date === "string" ? entry.date : null,
      excerpt: pickExcerpt(entry as Record<string, unknown>),
      image: typeof entry.image === "string" ? entry.image : undefined,
      label: getBlogLabel(entry),
      permalink: String(entry.permalink),
      title: String(entry.title),
    })),
)

const blogCardClass = (index: number) => {
  const pattern = [
    "min-h-[24rem] lg:col-span-7 lg:row-span-2",
    "min-h-[16rem] lg:col-span-5 lg:row-span-1",
    "min-h-[16rem] lg:col-span-4 lg:row-span-1",
    "min-h-[16rem] lg:col-span-4 lg:row-span-1",
    "min-h-[16rem] lg:col-span-4 lg:row-span-1",
    "min-h-[19rem] lg:col-span-6 lg:row-span-1",
    "min-h-[19rem] lg:col-span-6 lg:row-span-1",
  ]

  return pattern[index % pattern.length]
}

const blogCardFormat = (index: number, label: string) => {
  if (label === "Podcast") {
    return "Capsule audio"
  }

  const pattern = [
    "Grand format",
    "Récit visuel",
    "Format note",
    "Format note",
    "Récit visuel",
    "Format note",
    "Récit visuel",
  ]

  return pattern[index % pattern.length]
}

const blogCardToneClass = (index: number) => {
  const pattern = [
    "ring-1 ring-amber-200/10",
    "ring-1 ring-white/6",
    "ring-1 ring-white/4",
    "ring-1 ring-white/4",
    "ring-1 ring-white/6",
    "ring-1 ring-white/4",
    "ring-1 ring-white/6",
  ]

  return pattern[index % pattern.length]
}

const blogCardTitleClass = (index: number) => {
  const pattern = [
    "max-w-[10ch] font-display text-[clamp(2.2rem,3.2vw,4.1rem)] uppercase leading-[0.92]",
    "max-w-[13ch] font-display text-[clamp(1.7rem,2.2vw,2.7rem)] uppercase leading-[0.95]",
    "max-w-[22ch] font-body text-[clamp(1.15rem,1.25vw,1.4rem)] font-semibold leading-[1.35]",
    "max-w-[22ch] font-body text-[clamp(1.15rem,1.25vw,1.4rem)] font-semibold leading-[1.35]",
    "max-w-[13ch] font-display text-[clamp(1.7rem,2.2vw,2.7rem)] uppercase leading-[0.95]",
    "max-w-[22ch] font-body text-[clamp(1.15rem,1.25vw,1.4rem)] font-semibold leading-[1.35]",
    "max-w-[13ch] font-display text-[clamp(1.7rem,2.2vw,2.7rem)] uppercase leading-[0.95]",
  ]

  return pattern[index % pattern.length]
}

const blogCardExcerptClass = (index: number) => {
  const pattern = [
    "max-w-[38ch] text-sm leading-6 lg:text-base lg:leading-7",
    "max-w-[34ch] text-sm leading-6 lg:text-[0.95rem] lg:leading-7",
    "max-w-[46ch] text-sm leading-6",
    "max-w-[46ch] text-sm leading-6",
    "max-w-[34ch] text-sm leading-6 lg:text-[0.95rem] lg:leading-7",
    "max-w-[46ch] text-sm leading-6",
    "max-w-[34ch] text-sm leading-6 lg:text-[0.95rem] lg:leading-7",
  ]

  return pattern[index % pattern.length]
}

const blogImageSizes = (index: number) =>
  index % 7 === 0
    ? "(max-width: 1023px) 100vw, 58vw"
    : "(max-width: 1023px) 100vw, 42vw"

const formatCardDate = (value?: string | null) => {
  if (!value) {
    return ""
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? "" : dateFormatter.format(parsedDate)
}

const description =
  "Pensées et tribulations d'un grand curieux guadeloupéen, artiste photographe, geek, développeur et entrepreneur."

useHead({
  title: "Le Blog du Macojaune",
  meta: [
    {
      name: "title",
      content: "Le blog du Macojaune",
    },
    {
      name: "description",
      content: description,
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://macojaune.com/blog" },
    { property: "og:title", content: "Le blog du Macojaune" },
    {
      property: "og:description",
      content: description,
    },
    { property: "og:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
    { property: "twitter:url", content: "https://macojaune.com/" },
    { property: "twitter:title", content: "Le blog du Macojaune" },
    {
      property: "twitter:description",
      content: description,
    },
    { property: "twitter:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
  ],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
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
              "@id": "https://macojaune.com/blog",
              name: "Blog",
            },
          },
        ],
      }),
    },
  ],
})
</script>
