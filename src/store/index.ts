import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import candidateApplicationsReducer from './slices/candidateApplicationsSlice'
import candidateProfileReducer from './slices/candidateProfileSlice'
import notificationReducer from './slices/notificationSlice'
import permissionReducer from './slices/permissionSlice'
import recruiterPipelineReducer from './slices/recruiterPipelineSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidateApplications: candidateApplicationsReducer,
    candidateProfile: candidateProfileReducer,
    permission: permissionReducer,
    recruiterPipeline: recruiterPipelineReducer,
    ui: uiReducer,
    notification: notificationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
