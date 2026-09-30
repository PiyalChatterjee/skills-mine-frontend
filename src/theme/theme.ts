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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '@media (max-width: 767px)': {
            fontSize: '14px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:not(.wizard-back-button):not(.no-global-hover):not(.Mui-disabled):hover': {
            backgroundColor: '#2b96d9',
            borderColor: '#2b96d9',
            color: '#ffffff',
            '& *': {
              color: '#ffffff',
            },
            '& .MuiSvgIcon-root': {
              color: '#ffffff',
            },
            '& img, & svg': {
              filter: 'brightness(0) saturate(100%) invert(100%)',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#2A3132',
          '&.Mui-disabled': {
            color: '#B0B4B8',
            WebkitTextFillColor: '#B0B4B8',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '@media (max-width: 767px)': {
            '&.MuiTypography-h1': { fontSize: 'calc(2rem - 2px)' },
            '&.MuiTypography-h2': { fontSize: 'calc(1.5rem - 2px)' },
            '&.MuiTypography-h3': { fontSize: 'calc(3rem - 2px)' },
            '&.MuiTypography-h4': { fontSize: 'calc(2.125rem - 2px)' },
            '&.MuiTypography-h5': { fontSize: 'calc(1.5rem - 2px)' },
            '&.MuiTypography-h6': { fontSize: 'calc(1.25rem - 2px)' },
            '&.MuiTypography-subtitle1': { fontSize: 'calc(1rem - 2px)' },
            '&.MuiTypography-subtitle2': { fontSize: 'calc(0.875rem - 2px)' },
            '&.MuiTypography-body1': { fontSize: 'calc(1rem - 2px)' },
            '&.MuiTypography-body2': { fontSize: 'calc(0.875rem - 2px)' },
            '&.MuiTypography-button': { fontSize: 'calc(0.875rem - 2px)' },
            '&.MuiTypography-caption': { fontSize: 'calc(0.75rem - 2px)' },
            '&.MuiTypography-overline': { fontSize: 'calc(0.75rem - 2px)' },
          },
        },
      },
    },
  },
})
