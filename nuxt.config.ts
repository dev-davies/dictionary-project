export default defineNuxtConfig({
  app: {
    baseURL: '/dictionary-project/',

    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Dictionary by Davies',
      link: [
        { rel: 'icon', href: '/dictionary-project/logo.png' }
      ]
    }
  },

  css: [
    'bootstrap/dist/css/bootstrap.min.css',
    '~/assets/css/floating-labels.css'
  ],

  ssr: false,

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})
