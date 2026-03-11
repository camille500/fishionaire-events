import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-11',
  devtools: { enabled: true },

  modules: ['@clerk/nuxt', '@nuxtjs/i18n', '@vueuse/nuxt', '@vueuse/motion/nuxt'],

  nitro: {
    alias: {
      '#prisma/client': resolve(__dirname, 'prisma/generated/client/client.ts'),
    },
  },

  alias: {
    '#prisma/client': resolve(__dirname, 'prisma/generated/client/client.ts'),
  },

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
      billing: {
        nl: '/facturering',
        en: '/billing',
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
