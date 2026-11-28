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
    if (document.querySelector('script[src="https://static.axept.io/sdk.js"]')) return;
    window.axeptioSettings = {
        clientId: "62e86de9c231db01ef04b2cc",
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://static.axept.io/sdk.js";
    script.addEventListener("error", () => script.remove(), { once: true });
    document.head.append(script);
});
</script>
