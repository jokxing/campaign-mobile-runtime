export default defineNuxtConfig({
  compatibilityDate: '2026-07-07',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      previewEnabled: 'false',
      previewAllowedOrigins: ''
    }
  },
  css: ['~/assets/theme.css', '~/assets/main.css'],
  app: {
    head: {
      title: 'Moment Campaigns',
      meta: [{ name: 'description', content: 'Config-driven campaign runtime demo' }]
    }
  },
  typescript: { strict: true },
  vite: {
    optimizeDeps: { include: ['vant'] }
  }
});
