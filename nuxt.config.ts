// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      stripePublicKey: process.env.STRIPE_PUBLIC,
      serverURL: process.env.SERVER,
      snipcartKey: process.env.SNIPCART_KEY,
      gtmID: process.env.GTM_ID,
    },
  },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@nuxt/image-edge"],
  tailwindcss: {},
  content: {
    markdown: {
      remarkPlugins: ["remark-emoji"],
      rehypePlugins: ["rehype-external-links"],
      remarkExternalLinks: {
        target: "_blank",
      },
      rehypeExternalLinks: {
        target: "_blank",
      },
    },
  },
  image: {
    provider: "netlify",
  },
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
