import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ThemePreference = 'light' | 'dark' | 'system'

interface UiState {
  sidebarCollapsed: boolean
  themePreference: ThemePreference
  isGlobalLoading: boolean
}

const initialState: UiState = {
  sidebarCollapsed: false,
  themePreference: 'system',
  isGlobalLoading: false,
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
  },
})

export const { setSidebarCollapsed, setThemePreference, setGlobalLoading } =
  uiSlice.actions

export default uiSlice.reducer
