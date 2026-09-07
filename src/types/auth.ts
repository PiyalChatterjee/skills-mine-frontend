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
  candidateId?: string
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
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
  isFirstLogin?: boolean
}

export interface CurrentUserResponse {
  userId: string
  candidateId?: string
  candidate_id?: string
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
  mobileNumber: string
  password: string
  visitorId?: string
}

export interface CandidateRegistrationResponse {
  userId: string
  email: string
  role: 'JOB_SEEKER'
  registrationType: string
  accountStatus: string
}

export interface VisitorConversionRequest extends CandidateRegistrationRequest {
  visitorId: string
}

export interface StaffRegistrationRequest {
  firstName: string
  lastName: string
  email: string
  staffNumber: string
  password: string
  invitationToken: string
}

export interface StaffRegistrationResponse {
  userId: string
  staffNumber: string
  email: string
  role: Exclude<Role, 'JOB_SEEKER'>
  accountStatus: string
}

export interface GoogleTokenExchangeRequest {
  idToken: string
}

export type GoogleTokenExchangeResponse = CandidateRegistrationResponse

export interface TokenValidationResponse {
  valid: boolean
}

export interface StaffProfile {
  staffId: string
  userId: string
  staffNumber: string
  primaryEmail: string
  firstName: string
  lastName: string
  roleCode: Exclude<Role, 'JOB_SEEKER'>
  registrationStatus: string
  employmentStatus: string
  createdAt: string
  updatedAt: string
}

export interface CreateStaffProfileRequest {
  staffNumber: string
  primaryEmail: string
  roleCode: Exclude<Role, 'JOB_SEEKER'>
  firstName: string
  lastName: string
}

export interface CreateStaffProfileResponse {
  staffId: string
  userId: string
  staffNumber: string
  firstName: string
  lastName: string
  roleCode: Exclude<Role, 'JOB_SEEKER'>
  employmentStatus: string
}

export interface SendStaffInvitationRequest {
  email: string
  staffNumber: string
}

export interface SendStaffInvitationResponse {
  invitationId: string
  email: string
  staffNumber: string
  expiresAt: string
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  newPassword: string
  email?: string
  confirmationCode?: string
  currentPassword?: string
}

export interface ResetPasswordResponse {
  message: string
}