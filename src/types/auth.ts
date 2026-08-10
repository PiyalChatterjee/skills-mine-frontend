export const ROLES = ['JOB_SEEKER', 'RECRUITER', 'MANCO', 'EXCO', 'ADMIN'] as const

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
  idToken?: string
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
  accountStatus?: string
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

export interface LoginResponseData {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface LoginResponse {
  success: boolean
  statusCode: number
  message: string
  data: LoginResponseData
}

export interface CurrentUserResponse {
  userId: string
  email: string
  provider: string
  roles: Role[]
  staffProfile?: Record<string, unknown>
  accountStatus: string
}

export interface CandidateRegistrationRequest {
  firstName: string
  lastName: string
  email: string
  mobileNumber?: string
  password: string
  confirmPassword: string
  acceptTerms?: boolean
  acceptPrivacyPolicy?: boolean
}

export interface CandidateRegistrationResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    userId: string
    email: string
    accountStatus: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'
  }
}

export interface StaffRegistrationRequest {
  firstName: string
  lastName: string
  email: string
  mobileNumber?: string
  password: string
  confirmPassword: string
  invitationToken?: string
  acceptTerms?: boolean
  acceptPrivacyPolicy?: boolean
}

export interface StaffRegistrationResponse {
  success: boolean
  statusCode: number
  message: string
  data: {
    userId: string
    email: string
    accountStatus: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED'
  }
}

export interface GoogleTokenExchangeRequest {
  accessToken: string
}

export type GoogleTokenExchangeResponse = LoginResponse

// Backward-compat aliases
export type RegisterRequest = CandidateRegistrationRequest
export type SignUpRequest = CandidateRegistrationRequest
export type SignUpResponse = CandidateRegistrationResponse

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmNewPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}