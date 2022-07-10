import {defineNuxtConfig} from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      stripePublicKey: process.env.STRIPE_PUBLIC,
      serverURL: process.env.SERVER
    }
  },
  head: {
    charset: "utf-8",
    viewport: "width=device-width, initial-scale=1",
  },
  modules: [
    '@nuxt/content', '@nuxtjs/tailwindcss'
  ],
  content: {},
  tailwindcss: {},
  build: {
    transpile: ['moment']
  }
})
