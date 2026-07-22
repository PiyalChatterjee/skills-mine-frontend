import { apiClient } from '@/services/api/axios'
import { PERMISSIONS, type AuthUser, type JwtTokens, type Permission, type Role } from '@/types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
  expiresIn: number
}

interface MockLoginUser {
  id: string | number
  email?: string
  username?: string
  name?: string
  displayName?: string
  firstName?: string
  lastName?: string
  role?: Role
  permissions?: string[]
}

interface MockLoginApiResponse {
  token: string
  user: MockLoginUser
  expiresIn: number
}

const rolePermissions: Record<Role, Permission[]> = {
  candidate: [],
  recruiter: ['CRM_VIEW', 'CRM_EDIT', 'MANDATE_CREATE', 'MANDATE_EDIT', 'PIPELINE_ADVANCE', 'PIPELINE_VIEW'],
  manco: ['PIPELINE_VIEW', 'REPORT_VIEW'],
  exco: ['REPORT_VIEW'],
  admin: [
    'MANDATE_CREATE',
    'MANDATE_EDIT',
    'PIPELINE_ADVANCE',
    'PIPELINE_VIEW',
    'CRM_VIEW',
    'CRM_EDIT',
    'REPORT_VIEW',
  ],
}

const normalizePermissions = (
  role: Role,
  permissions?: string[],
): Permission[] => {
  if (!permissions || permissions.length === 0) {
    return rolePermissions[role]
  }

  if (permissions.includes('ALL')) {
    return [...PERMISSIONS]
  }

  return permissions.filter((permission): permission is Permission =>
    PERMISSIONS.includes(permission as Permission),
  )
}

const toAuthUser = (user: MockLoginUser): AuthUser => {
  const role = user.role ?? 'candidate'
  const fallbackName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
  const derivedName = fallbackName || user.username || user.email || 'SkillsMine User'
  const displayName =
    user.displayName ??
    user.name ??
    derivedName

  return {
    id: String(user.id),
    email: user.email ?? `${user.username ?? 'user'}@skillsmine.local`,
    displayName,
    role,
    permissions: normalizePermissions(role, user.permissions),
  }
}

export const mapLoginResponseToSession = (
  response: LoginResponse,
): { user: AuthUser; tokens: JwtTokens } => ({
  user: response.user,
  tokens: {
    accessToken: response.token,
  },
})

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<MockLoginApiResponse>(
      import.meta.env.VITE_AUTH_LOGIN_ENDPOINT,
      payload,
    )

    return {
      token: response.data.token,
      user: toAuthUser(response.data.user),
      expiresIn: response.data.expiresIn,
    }
  },
  refresh: () =>
    apiClient.post<JwtTokens>(import.meta.env.VITE_AUTH_ME_ENDPOINT),
  logout: () =>
    apiClient.post<null>(import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT),
}
