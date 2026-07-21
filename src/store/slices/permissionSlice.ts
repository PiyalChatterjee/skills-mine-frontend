import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Permission } from '@/types/auth'

interface PermissionState {
  granted: Permission[]
}

const initialState: PermissionState = {
  granted: [],
}

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.granted = action.payload
    },
    clearPermissions: (state) => {
      state.granted = []
    },
  },
})

export const { setPermissions, clearPermissions } = permissionSlice.actions

export default permissionSlice.reducer
