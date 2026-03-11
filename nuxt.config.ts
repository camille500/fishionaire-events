export default defineNuxtConfig({
  compatibilityDate: '2025-03-11',
  devtools: { enabled: true },

  modules: ['@clerk/nuxt', '@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  clerk: {
    signInForceRedirectUrl: '/dashboard',
    signUpForceRedirectUrl: '/dashboard',
  },

  i18n: {
    defaultLocale: 'nl',
    fallbackLocale: 'en',
    strategy: 'prefix_except_default',
    lazy: true,
    locales: [
      { code: 'nl', name: 'Nederlands', file: 'nl.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'config',
    pages: {
      features: {
        nl: '/functies',
        en: '/features',
      },
      pricing: {
        nl: '/prijzen',
        en: '/pricing',
      },
      help: {
        nl: '/hulp',
        en: '/help',
      },
    },
  },

  components: [
    { path: '~/components/atoms', prefix: '' },
    { path: '~/components/molecules', prefix: '' },
    { path: '~/components/organisms', prefix: '' },
    { path: '~/components/templates', prefix: '' },
  ],

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
