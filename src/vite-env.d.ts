/// <reference types="vite/client" />

interface ImportMetaEnv {
  // ── Gateway host (single source of truth for all service base URLs) ────────
  readonly VITE_API_BASE_URL: string

  // ── Third-party credentials ────────────────────────────────────────────────
  readonly VITE_GOOGLE_CLIENT_ID: string

  // ── Cognito Hosted UI ──────────────────────────────────────────────────────
  readonly VITE_COGNITO_DOMAIN: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
