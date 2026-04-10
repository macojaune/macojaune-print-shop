const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://macojaune.com"
const assetBaseUrl =
  process.env.NUXT_PUBLIC_ASSET_BASE_URL ||
  process.env.R2_PUBLIC_BASE_URL ||
  "https://cdn.macojaune.com"
const stripeSecretKey =
  process.env.NUXT_STRIPE_KEY ||
  process.env.NUXT_STRIPE_SECRET_KEY ||
  process.env.NUXT_STRIPE_TOKEN ||
  process.env.STRIPE_SECRET_KEY ||
  ""
const stripePublishableKey =
  process.env.NUXT_PUBLIC_STRIPE_KEY ||
  process.env.NUXT_PUBLIC_STRIPE_API_KEY ||
  process.env.NUXT_PUBLIC_STRIPE_PUBLIC_KEY ||
  process.env.STRIPE_PUBLISHABLE_KEY ||
  ""
const stripeWebhookSecret =
  process.env.NUXT_STRIPE_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET ||
  ""
const generatedWatchIgnores = [
  "**/assets/photo-originals/**",
  "**/generated/**",
  "**/public/admin/**",
  "**/public/derived/**",
]

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  watchers: {
    chokidar: {
      ignored: generatedWatchIgnores,
    },
  },
  runtimeConfig: {
    stripe: {
      key: stripeSecretKey,
      webhookSecret: stripeWebhookSecret,
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
        key: stripePublishableKey,
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
  vite: {
    server: {
      watch: {
        ignored: generatedWatchIgnores,
      },
    },
  },
  css: ['@/assets/css/tailwind.css'],
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
