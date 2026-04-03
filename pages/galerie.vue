<template>
    <div class="min-h-screen w-full px-4 pb-16">
        <div class="mx-auto max-w-[1600px]">
            <header class="mb-10 pt-4 lg:mb-14">
                <div class="mt-4 flex flex-col gap-6 lg:items-start lg:justify-between">
                    <NuxtLink to="/"
                        class="inline-flex w-fit items-center px-0 py-2 text-xs uppercase tracking-[0.28em] text-stone-300 transition hover:text-amber-200">
                        Retour à l&apos;accueil
                    </NuxtLink>
                    <div>
                        <h1 class="font-display text-5xl leading-none text-amber-400 sm:text-6xl lg:text-[6.5rem]">
                            Le monde à travers mon œil
                        </h1>
                    </div>

                </div>
            </header>

            <ContentList v-slot="{ list }" :query="runQuery">
                <div class="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
                    <NuxtLink v-for="tile in getGalleryBoardTiles(list)" :key="`${tile.seriesSlug}-${tile.src}`"
                        :to="`/series/${tile.seriesSlug}`"
                        class="group relative mb-4 block break-inside-avoid overflow-hidden">
                        <RunImage :src="tile.src" :alt="tile.alt" variant="card"
                            sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, (max-width: 1535px) 33vw, 25vw"
                            class="w-full object-cover transition duration-500 ease-out group-hover:scale-[1.015]" />

                        <div
                            class="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/78 via-black/14 to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
                            <div class="flex w-full items-end justify-between gap-4 p-4">
                                <div>
                                    <p class="font-display text-2xl uppercase leading-none text-white">
                                        {{ tile.seriesTitle }}
                                    </p>
                                    <p v-if="tile.seriesDate"
                                        class="mt-2 text-[11px] uppercase tracking-[0.3em] text-amber-300/80">
                                        {{ formatPhotoDate(tile.seriesDate) }}
                                    </p>
                                </div>
                                <span class="text-[11px] uppercase tracking-[0.28em] text-stone-200">
                                    Ouvrir
                                </span>
                            </div>
                        </div>
                    </NuxtLink>
                </div>
            </ContentList>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { QueryBuilderParams } from "@nuxt/content/types"
import { formatPhotoDate } from "../utils/photo-dates"
import { getSeriesGalleryTiles } from "../utils/runs"
import type { RunLike } from "../utils/runs"

const { toAssetUrl } = useAssetUrls()

const runQuery: QueryBuilderParams = {
    path: "/runs",
    sort: { date: -1 },
}

type GalleryBoardRun = RunLike & {
    slug: string
    date?: string
}

const getGalleryBoardTiles = (runs: GalleryBoardRun[]) =>
    runs.flatMap((run) =>
        getSeriesGalleryTiles(run).map((tile) => ({
            ...tile,
            seriesSlug: run.slug,
            seriesTitle: run.title || "Serie",
            seriesDate: run.date,
            alt: tile.alt || run.title || "Serie photo",
        })),
    )

const description =
    "Découvrez les séries photo de Macojaune dans Yellow Art Gallery."

useHead({
    title: "Yellow Art Gallery - Macojaune",
    meta: [
        {
            name: "title",
            content: "Yellow Art Gallery - Macojaune",
        },
        {
            name: "description",
            content: description,
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/galerie" },
        { property: "og:title", content: "Yellow Art Gallery" },
        {
            property: "og:description",
            content: description,
        },
        { property: "og:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
        {
            property: "twitter:card", content: "summary_large_image",
        },
        { property: "twitter:url", content: "https://macojaune.com/galerie" },
        { property: "twitter:title", content: "Yellow Art Gallery" },
        {
            property: "twitter:description",
            content: description,
        },
        { property: "twitter:image", content: toAssetUrl("/pictures/dsc06261.jpg") },
    ],
    link: [
        {
            rel: "canonical",
            href: "https://macojaune.com/galerie",
        },
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
                            "@id": "https://macojaune.com/",
                            name: "Macojaune.com",
                        },
                    },
                    {
                        "@type": "ListItem",
                        position: 2,
                        item: {
                            "@id": "https://macojaune.com/galerie",
                            name: "Yellow Art Gallery",
                        },
                    },
                ],
            }),
        },
    ],
})
</script>
