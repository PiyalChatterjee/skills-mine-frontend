import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/app/auth/tokenStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = tokenStorage.getTokens()
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clearTokens()
    }
    return Promise.reject(error)
  },
)
