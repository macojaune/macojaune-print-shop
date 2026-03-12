const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://macojaune.com'
const assetBaseUrl = process.env.NUXT_PUBLIC_ASSET_BASE_URL || 'https://cdn.macojaune.com'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    tursoDB:'',
    tursoToken:'',
    public: {
      stripeApiKey: '',
      serverURL: '',
      siteUrl,
      assetBaseUrl,
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@unlok-co/nuxt-stripe',
    '@nuxt/image',
    "@nuxt/eslint"
  ],
  tailwindcss: {},
  content: {
    markdown: {
      remarkPlugins: ['remark-emoji'],
      rehypePlugins: { 'rehype-external-links': { target: '_blank' } }
    }
  },
  image: {
    provider: 'none'
  },
  css: ['~/assets/css/tailwind.css'],
  stripe: {
    // Server
    server: {
      key: process.env.NUXT_STRIPE_TOKEN,
      options: {
        // your api options override for stripe server side
        // https://github.com/stripe/stripe-node?tab=readme-ov-file#configuration
      }
    },
    // CLIENT
    client: {
      key:  process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY,
      // your api options override for stripe client side https://stripe.com/docs/js/initializing#init_stripe_js-options
      options: {}
    }
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Macojaune.com',
      htmlAttrs:{lang:'fr'}
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
