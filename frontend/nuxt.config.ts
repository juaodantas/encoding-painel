// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Encoding Painel',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  vite: {
    logLevel: 'error'
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.includes('-')
    }
  },
  typescript: {
    strict: true
  },
  runtimeConfig: {
    public: {
      apiUrl: process.env.PUBLIC_API_URL || 'http://localhost:3001'
    }
  },
  nitro: {
    compatibilityDate: '2025-06-02'
  }
})