export const ROLES = ['candidate', 'recruiter', 'manco', 'exco', 'admin'] as const

export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'MANDATE_CREATE',
  'MANDATE_EDIT',
  'PIPELINE_ADVANCE',
  'PIPELINE_VIEW',
  'CRM_VIEW',
  'CRM_EDIT',
  'REPORT_VIEW',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export interface JwtTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: Role
  permissions: Permission[]
}

export interface AuthSession {
  user: AuthUser | null
  tokens: JwtTokens | null
  isAuthenticated: boolean
}