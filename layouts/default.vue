<template lang="pug">
.main.flex.flex-col.justify-between.h-full.w-full.overflow-auto
  Header
  .container.mx-auto.px-4.w-full
    .mb-4.p-3.rounded-md.bg-gradient-to-r.from-red-500.to-orange-500.text-black.font-semibold.text-center
      | La boutique est momentanément suspendue.
      |
      b.font-bold.text-white Contacte-moi en DM (IG, Twitter) pour commander tes tirages photo
    slot
    // #snipcart(hidden :data-api-key="cPublic.snipcartKey")
  Footer
</template>

<script setup>
import { onMounted } from "vue";
const { public: cPublic } = useRuntimeConfig();
useHead({
    script: [
        {
            src: "https://analytics.marvinl.com/script.js",
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
        e.src = "//static.axept.io/sdk.js";
        t.parentNode.insertBefore(e, t);
    })(document, "script");
});
</script>
