import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationReducer from './slices/notificationSlice'
import permissionReducer from './slices/permissionSlice'
import recruiterPipelineReducer from './slices/recruiterPipelineSlice'
import uiReducer from './slices/uiSlice'
import { apiSlice } from '@/store/api/apiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permission: permissionReducer,
    recruiterPipeline: recruiterPipelineReducer,
    ui: uiReducer,
    notification: notificationReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
