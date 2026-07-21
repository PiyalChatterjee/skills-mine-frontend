import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthSession, AuthUser, JwtTokens } from '@/types/auth'

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated'

interface AuthState extends AuthSession {
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthSession: (
      state,
      action: PayloadAction<{ user: AuthUser; tokens: JwtTokens }>,
    ) => {
      state.user = action.payload.user
      state.tokens = action.payload.tokens
      state.isAuthenticated = true
      state.status = 'authenticated'
    },
    clearAuthSession: (state) => {
      state.user = null
      state.tokens = null
      state.isAuthenticated = false
      state.status = 'unauthenticated'
    },
    setAuthStatus: (state, action: PayloadAction<AuthStatus>) => {
      state.status = action.payload
    },
  },
})

export const { setAuthSession, clearAuthSession, setAuthStatus } = authSlice.actions

export default authSlice.reducer
