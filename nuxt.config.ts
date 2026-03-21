import { resolve } from 'path'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-11',
  devtools: { enabled: true },
  devServer: { host: '0.0.0.0' },

  modules: [
    '@nuxt/ui',
    '@clerk/nuxt',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    'motion-v/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
  ],

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

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [500, 600, 700, 800] },
    ],
  },

  icon: {
    serverBundle: 'remote',
  },

  motionV: {
    directives: true,
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
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsBucket: process.env.AWS_BUCKET || '',
    awsRegion: process.env.AWS_REGION || 'eu-west-1',
    awsCdnUrl: process.env.AWS_CDN_URL || '',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripeStandardPriceId: process.env.STRIPE_STANDARD_PRICE_ID || '',
    stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    stripeStandardYearlyPriceId: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID || '',
    stripeProYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    stripeEventStandardPriceId: process.env.STRIPE_EVENT_STANDARD_PRICE_ID || '',
    stripeEventProPriceId: process.env.STRIPE_EVENT_PRO_PRICE_ID || '',
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    awsSesFromEmail: process.env.AWS_SES_FROM_EMAIL || 'noreply@fishionaire.com',
    awsSesFromName: process.env.AWS_SES_FROM_NAME || 'Fishionaire Events',
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  },

  colorMode: {
    preference: 'light',
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})
