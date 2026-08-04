import { Provider } from 'react-redux'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from '@/app/auth/AuthContext'
import { NotificationToaster } from '@/components/NotificationToaster'
import { store } from '@/store'
import { appTheme } from '@/theme/theme'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

export const AppProviders = ({ children }: PropsWithChildren) => {
  const appTree = (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider theme={appTheme}>
            <CssBaseline />
            {children}
            <NotificationToaster />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )

  if (!googleClientId) {
    return appTree
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appTree}
    </GoogleOAuthProvider>
  )
}
