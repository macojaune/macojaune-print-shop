// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    stripeToken: '',
    public: {
      stripePublicKey: '',
      serverURL: '',
      gtmID: ''
    }
  },
  modules: [
    '@nuxtjs/eslint-module',
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
    provider: 'netlify'
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
  build: {
    transpile: ['moment']
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Macojaune.com'
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  }
})
