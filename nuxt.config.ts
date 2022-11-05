// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      stripePublicKey: process.env.NUXT_ENV_STRIPE_PUBLIC,
      serverURL: process.env.NUXT_ENV_SERVER,
      snipcartKey: process.env.SNIPCART_KEY,
    },
  },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@nuxt/image-edge"],
  tailwindcss: {},
  content: {},
  css: ["~/assets/css/tailwind.css"],
  build: {
    transpile: ["moment"],
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Macojaune.com",
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
});
