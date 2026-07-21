import { createTheme } from '@mui/material/styles'
import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.brand.primary,
    },
    secondary: {
      main: colors.brand.secondary,
    },
    success: {
      main: colors.semantic.success,
    },
    warning: {
      main: colors.semantic.warning,
    },
    error: {
      main: colors.semantic.error,
    },
    info: {
      main: colors.semantic.info,
    },
    background: {
      default: colors.neutral[50],
      paper: colors.neutral[0],
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[500],
    },
  },
  typography,
  spacing: (factor: number) => `${factor * spacing.sm}px`,
  shape: {
    borderRadius: spacing.sm,
  },
})
