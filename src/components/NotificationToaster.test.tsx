import { fireEvent, render, screen } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { NotificationToaster } from './NotificationToaster'
import notificationReducer, { pushNotification } from '@/store/slices/notificationSlice'

const renderToaster = () => {
  const store = configureStore({
    reducer: { notification: notificationReducer },
  })

  store.dispatch(
    pushNotification({
      title: 'Saved',
      message: 'Your job was saved.',
      level: 'success',
    }),
  )

  render(
    <Provider store={store}>
      <NotificationToaster />
    </Provider>,
  )

  return store
}

describe('NotificationToaster', () => {
  it('renders the current notification with its message', () => {
    renderToaster()

    expect(screen.getByRole('alert')).toHaveTextContent('Saved: Your job was saved.')
  })

  it('removes the current notification when the alert is closed', () => {
    const store = renderToaster()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(store.getState().notification.items).toHaveLength(0)
  })
})
