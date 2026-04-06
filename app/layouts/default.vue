<template lang="pug">
.main.flex.flex-col.justify-between.h-full.w-full.overflow-auto
  a(
    href="#main-content"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-black focus:px-4 focus:py-3 focus:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300/90"
  ) Aller au contenu
  Header
  main#main-content.container.mx-auto.px-4.w-full(tabindex="-1")
    slot
  Footer
</template>

<script setup>
import { onMounted } from "vue";
useHead({
    script: [
        {
            src: "https://analytics.macojaune.com/script.js",
            "data-website-id": "0b0e019d-fed5-4e0d-aa0b-01c8811b7a53",
            defer: true,
        },
    ],
});
onMounted(() => {
    window.axeptioSettings = {
        clientId: "62e86de9c231db01ef04b2cc",
    };

    (function (d, s) {
        const t = d.getElementsByTagName(s)[0];
        const e = d.createElement(s);
        e.async = true;
        e.src = "https://static.axept.io/sdk.js";
        t.parentNode.insertBefore(e, t);
    })(document, "script");
});
</script>
