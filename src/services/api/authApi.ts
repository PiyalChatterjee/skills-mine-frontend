import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'
import type { AuthUser, JwtTokens } from '@/types/auth'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: AuthUser
  tokens: JwtTokens
}

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload),
  refresh: () => apiClient.post<ApiResponse<JwtTokens>>('/auth/refresh'),
  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),
}
