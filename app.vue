<template lang="pug">
.app.h-screen.relative.w-screen
  NuxtLayout
    NuxtPage
</template>

<script lang="ts" setup>
import '@/assets/css/tailwind.css'
const config = useRuntimeConfig()
useHead({
  meta: [
    {
      name: 'description',
      content:
        "La boutique du Macojaune, vente de tirages photos, paiement en ligne sécurisé et livraison à l'international. Pour ton salon ou tes WC, procure toi ton œuvre préférée en édition limitée."
    }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'http://schema.org',
        '@type': 'ArtGallery',
        name: 'Macojaune',
        url: 'macojaune.com',
        email: 'hello@macojaune.com',
        paymentAccepted:
          'Visa, Master Card, Amex, ApplePay, AndroidPay, Bitcoin'
      })
    },
    {
      innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; j.async = true; j.src =
        'https://www.googletagmanager.com/gtm.js?id=' + i + dl; f.parentNode.insertBefore(j, f);
}) (window, document, 'script', 'dataLayer', '${config.gtmID}');`
    }
  ],
  noscript: [{
    innerHTML: `<iframe src="https://www.googletagmanager.com/ns.html?id=${config.gtmID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`
  }]
})
</script>
<style lang="stylus">
@import url('https://fonts.googleapis.com/css2?family=Hind:wght@300;400;500;600;700&family=Righteous&display=swap')
html
  background-color: #000000;

.app
  background-image: url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm33.414-6l5.95-5.95L45.95.636 40 6.586 34.05.636 32.636 2.05 38.586 8l-5.95 5.95 1.414 1.414L40 9.414l5.95 5.95 1.414-1.414L41.414 8zM40 48c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm0-2c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM9.414 40l5.95-5.95-1.414-1.414L8 38.586l-5.95-5.95L.636 34.05 6.586 40l-5.95 5.95 1.414 1.414L8 41.414l5.95 5.95 1.414-1.414L9.414 40z' fill='%23fbc02d' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
  animation: move-background 100s linear infinite;

@keyframes move-background
  from
    background-position 0 0
  to
    background-position 1000px 1000px

.page-enter-active
.page-leave-active
  transition: all 0.4s

.page-enter-from
.page-leave-to
  opacity: 0
  filter: blur(1rem)

</style>
