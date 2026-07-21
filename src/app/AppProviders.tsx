import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { ThemeProvider, CssBaseline } from '@mui/material'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/app/auth/AuthContext'
import { queryClient } from '@/app/queryClient'
import { store } from '@/store'
import { appTheme } from '@/theme/theme'

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={appTheme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </QueryClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  )
}
