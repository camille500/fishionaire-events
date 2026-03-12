import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-11',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@clerk/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@vueuse/motion/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
  ],

  nitro: {
    preset: 'aws-amplify',
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

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [500, 600, 700, 800] },
    ],
  },

  icon: {
    serverBundle: 'remote',
  },

  motion: {
    directives: {
      'pop-bottom': {
        initial: { opacity: 0, y: 100, scale: 0.9 },
        visibleOnce: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 25 } },
      },
      'slide-visible-left': {
        initial: { opacity: 0, x: -80 },
        visibleOnce: { opacity: 1, x: 0, transition: { duration: 600 } },
      },
      'slide-visible-right': {
        initial: { opacity: 0, x: 80 },
        visibleOnce: { opacity: 1, x: 0, transition: { duration: 600 } },
      },
      'fade-visible': {
        initial: { opacity: 0, y: 30 },
        visibleOnce: { opacity: 1, y: 0, transition: { duration: 500 } },
      },
      'fade-visible-slow': {
        initial: { opacity: 0, y: 40 },
        visibleOnce: { opacity: 1, y: 0, transition: { duration: 800 } },
      },
      'scale-visible': {
        initial: { opacity: 0, scale: 0.9 },
        visibleOnce: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
      },
    },
  },

  i18n: {
    defaultLocale: 'nl',
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
    openaiApiKey: process.env.OPENAI_API_KEY || '',
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
