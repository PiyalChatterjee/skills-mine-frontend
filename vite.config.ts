import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
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
