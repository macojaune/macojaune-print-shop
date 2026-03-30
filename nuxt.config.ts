const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://macojaune.com"
const assetBaseUrl =
  process.env.NUXT_PUBLIC_ASSET_BASE_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  "https://cdn.macojaune.com"

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  runtimeConfig: {
    stripe: {
      key: '',
      webhookSecret: '',
      options: {},
    },
    turso: {
      url: '',
      authToken: '',
    },
    r2: {
      accountId: process.env.R2_ACCOUNT_ID || '',
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      bucket: process.env.R2_BUCKET || process.env.R2_BUCKET_NAME || '',
      mastersPrefix: 'masters/runs',
      publicPrefix: 'pictures/runs',
      manifestPrefix: 'manifests/runs',
    },
    public: {
      stripe: {
        key: '',
        options: {},
      },
      serverURL: '',
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL || process.env.R2_PUBLIC_BASE_URL || assetBaseUrl,
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
    build: {
      markdown: {
        remarkPlugins: {
          'remark-emoji': {},
        },
        rehypePlugins: {
          'rehype-external-links': {
            target: '_blank',
          },
        },
      }
    }
  },
  image: {
    provider: 'none'
  },
  css: ['~/assets/css/tailwind.css'],
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
