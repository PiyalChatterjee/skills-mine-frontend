import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ThemePreference = 'light' | 'dark' | 'system'
export type LandingMode = 'findJob' | 'startHiring'

interface UiState {
  sidebarCollapsed: boolean
  themePreference: ThemePreference
  isGlobalLoading: boolean
  landingMode: LandingMode
}

const initialState: UiState = {
  sidebarCollapsed: false,
  themePreference: 'system',
  isGlobalLoading: false,
  landingMode: 'findJob',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setThemePreference: (state, action: PayloadAction<ThemePreference>) => {
      state.themePreference = action.payload
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload
    },
    setLandingMode: (state, action: PayloadAction<LandingMode>) => {
      state.landingMode = action.payload
    },
  },
})

export const { setSidebarCollapsed, setThemePreference, setGlobalLoading, setLandingMode } =
  uiSlice.actions

export default uiSlice.reducer
