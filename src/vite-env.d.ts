/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_AUTH_LOGIN_ENDPOINT: string
  readonly VITE_AUTH_ME_ENDPOINT: string
  readonly VITE_AUTH_LOGOUT_ENDPOINT: string
  readonly VITE_REQUEST_TIMEOUT_MS: string
  readonly VITE_MOCK_ERROR_RATE: string
  readonly VITE_MOCK_DELAY_MIN_MS: string
  readonly VITE_MOCK_DELAY_MAX_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}