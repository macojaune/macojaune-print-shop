<template>
    <div class="relative w-full px-4">
        <div class="flex flex-col gap-5 lg:flex-row lg:justify-around">
            <h1>À propos</h1>
            <section class="">
                <h2>Expositions collectives</h2>
                <ul>
                    <li>
                        <b>25 avril-1er mai 2024</b> — Corpuscules, exposition
                        collective Capsule, Lancement DOKRE.I.S. Galerie
                        Emergenc’Art
                    </li>

                    <li>
                        <b>7-15 novembre 2022</b> — Salon Français, exposition
                        d’art contemporain Arawak Beach Resort, Pavillon
                        ART+RHUM
                    </li>
                </ul>
                <h2>Publications artistiques</h2>
                <ul>
                    <li>
                        DOKRE.I.S #6 Fragments / Mòso en collaboration avec
                        <a href="https://tessanaime.fr" target="_blank"
                            >Tessa Naime</a
                        >
                    </li>
                    <li>
                        <a
                            href="https://www.calameo.com/books/006255475d8f8ef49b8aa"
                            target="_blank"
                            >NEG #3</a
                        >
                    </li>
                    <li>DOKRE.I.S #5 Fête / Fèt</li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useHead } from "unhead";

useHead({
    title: "Macojaune - À propos",
    meta: [
        {
            name: "title",
            content: "Macojaune - À propos",
        },
        {
            name: "description",
            content:
                "À propos de Macojaune, expositions collectives et publications artistiques",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://macojaune.com/" },
        {
            property: "og:title",
            content:
                "Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux",
        },
        {
            property: "og:description",
            content: description,
        },
        { property: "og:image", content: "/pictures/dsc06261.jpg" },
        {
            property: "twitter:card",
            content: "summary_large_image",
        },
        { property: "twitter:url", content: "https://macojaune.com/" },
        {
            property: "twitter:title",
            content:
                "Macojaune.com - Photographe, Développeur Web, Entrepreneur et Grand Curieux",
        },
        {
            property: "twitter:description",
            content: description,
        },
        {
            property: "twitter:image",
            content: "https://macojaune.com/pictures/dsc06261.jpg",
        },
    ],
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
                        {
                            "@type": "ListItem",
                            position: 1,
                            item: {
                                "@id": "https://macojaune.com/a-propos",
                                name: "À propos",
                            },
                        },
                    ],
                },
            ],
        },
    ],
});
</script>
