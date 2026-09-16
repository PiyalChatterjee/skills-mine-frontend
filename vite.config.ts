import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker is generated at build time; not active in dev by default
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'The Skills Mine',
        short_name: 'Skills Mine',
        description: 'Cultivating Growth - AI-powered talent matching platform',
        theme_color: '#03478c',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache app shell + assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Don't cache API calls or auth endpoints
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        // Auth module - component, page, type, and service layers
        'src/modules/auth/components/AuthHero.tsx',
        'src/modules/auth/components/AuthPasswordField.tsx',
        'src/modules/auth/pages/LoginPage.tsx',
        'src/modules/auth/pages/SignupPage.tsx',
        'src/modules/auth/types/login.ts',
        'src/modules/auth/types/signup.ts',
        // Candidate module - component, hook, and service layers
        'src/modules/candidate/components/ProfileFormFields.tsx',
        'src/modules/candidate/hooks/useCandidateQueries.ts',
        // CV Builder module - hook and schema layers (with tests)
        'src/modules/cv-builder/hooks/useCvBuilderDone.ts',
        'src/modules/cv-builder/types/cvBuilderSchema.ts',
        // App auth utilities
        'src/app/auth/jwt.ts',
        'src/app/auth/tokenStorage.ts',
        'src/app/queryErrorHandler.ts',
        // API services
        'src/services/api/authApi.ts',
        'src/services/api/candidateApi.ts',
        // Redux - slices and API slice
        'src/store/slices/authSlice.ts',
        'src/store/slices/candidateSlice.ts',
        'src/store/api/apiSlice.ts',
        'src/store/api/queryHelpers.ts',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts'],
    },
  },
})
