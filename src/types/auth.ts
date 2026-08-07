export const ROLES = ['JOB_SEEKER', 'RECRUITER', 'MANCO', 'ADMIN'] as const

export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'VIEW_JOBS',
  'APPLY_JOB',
  'UPLOAD_CV',
  'VIEW_DASHBOARD',
  'MANDATE_CREATE',
  'MANDATE_EDIT',
  'PIPELINE_VIEW',
  'PIPELINE_ADVANCE',
  'CRM_EDIT',
  'CANDIDATE_VIEW',
  'REPORT_VIEW',
  'RECRUITER_VIEW',
  'ALL',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export interface JwtTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthUser {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  role: Role
  roles: Role[]
  recruiterId?: string
  profileCompleted?: number
  permissions: Permission[]
}

export interface AuthSession {
  user: AuthUser | null
  tokens: JwtTokens | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface GoogleTokenExchangeRequest {
  accessToken: string
}

export type GoogleTokenExchangeResponse = LoginResponse

export interface RegisterRequest {
  userType?: Role
  firstName: string
  lastName: string
  email: string
  mobileNumber?: string
  password: string
  confirmPassword: string
  acceptTerms?: boolean
  acceptPrivacyPolicy?: boolean
}

export type SignUpRequest = RegisterRequest

export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  expiresIn: number
  profileCompleted: number
  roles: Role[]
}

export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  data: LoginResponseData
}

export interface SignUpResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    userId: string
    email: string
    accountStatus: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}