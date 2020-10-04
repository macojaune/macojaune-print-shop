import colors from 'vuetify/es5/util/colors'

export default {
  target: 'static',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: '%s - YELLOW ART SHOP',
    title: 'Yellow Art Shop — La boutique de @Macojaune',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content:
          'Commandez vos tirages photos en ligne. Éditions limitées. Livraison partout.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://macojaune.com' },
      {
        property: 'og:title',
        content: 'Yellow Art Shop — La boutique de @Macojaune',
      },
      {
        property: 'og:description',
        content:
          'Commandez vos tirages photos en ligne. Éditions limitées. Livraison partout. ',
      },
      {
        property: 'og:image',
        content: 'https://aprc.it/api/1200x628/http://macojaune.com/',
      },
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: 'https://metatags.io/' },
      {
        property: 'twitter:title',
        content: 'Yellow Art Shop — La boutique de @Macojaune',
      },
      {
        property: 'twitter:description',
        content:
          'Commandez vos tirages photos en ligne. Éditions limitées. Livraison partout. ',
      },
      {
        property: 'twitter:image',
        content: 'https://aprc.it/api/1200x628/http://macojaune.com/',
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://app.snipcart.com' },
      { rel: 'preconnect', href: 'https://cdn.snipcart.com' },
      {
        rel: 'stylesheet',
        href: 'https://cdn.snipcart.com/themes/v3.0.21/default/snipcart.css',
      },
    ],
  },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: ['~/plugins/formatDate.js'],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/pwa',
    'nuxt-webfontloader',
    '@nuxt/content',
    '@nuxtjs/gtm',
  ],
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    treeShake: true,
    customVariables: ['./assets/variables.scss'],
    theme: {
      options: { customProperties: true },
      dark: true,
      themes: {
        dark: {
          primary: colors.yellow.darken2,
          accent: colors.red.base,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.red.darken1,
          error: colors.deepOrange.accent4,
          success: colors.teal.accent3,
        },
      },
    },
  },
  webfontloader: {
    google: {
      families: ['Righteous:400', 'Hind:400,600'],
    },
  },
  content: {},
  gtm: {
    id: 'GTM-P5TVD3V',
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
}
