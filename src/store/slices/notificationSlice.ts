import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  title: string
  message?: string
  level: NotificationLevel
}

interface NotificationState {
  items: NotificationItem[]
}

const initialState: NotificationState = {
  items: [],
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    pushNotification: {
      reducer: (state, action: PayloadAction<NotificationItem>) => {
        state.items.push(action.payload)
      },
      prepare: (payload: Omit<NotificationItem, 'id'>) => ({
        payload: { ...payload, id: nanoid() },
      }),
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.items = []
    },
  },
})

export const { pushNotification, removeNotification, clearNotifications } =
  notificationSlice.actions

export default notificationSlice.reducer
