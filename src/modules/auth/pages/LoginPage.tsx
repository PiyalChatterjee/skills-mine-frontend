import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { useZodForm } from '@/hooks/useZodForm'
import { loginSchema, type LoginFormValues } from '@/modules/auth/types'
import { authApi, mapLoginResponseToSession } from '@/services/api/authApi'
import heroImage from '@/assets/hero.png'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setSubmitError(null)

      const response = await authApi.login(values)
      login(mapLoginResponseToSession(response))
      navigate('/', { replace: true })
    } catch {
      setSubmitError('Login failed. Check your credentials and try again.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FFFFFF' }}>
      <Box sx={{ height: 99, borderBottom: '1px solid #E1E3E6' }}>
        <Box
          sx={{
            height: '100%',
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, md: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography
            sx={{
              color: '#03478C',
              fontFamily: 'Red Hat Display, Segoe UI, Helvetica Neue, Arial, sans-serif',
              fontWeight: 700,
              fontSize: { xs: 24, md: 32 },
              letterSpacing: '0.2px',
            }}
          >
            SkillsMine
          </Typography>
          <Button
            variant="text"
            sx={{
              color: '#03478C',
              textTransform: 'none',
              fontFamily: 'Red Hat Text, Segoe UI, Helvetica Neue, Arial, sans-serif',
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            Need help?
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 220, md: 260 },
          background: 'linear-gradient(69deg, #2B96D9 0%, #32ABBF 100%)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 12%, rgba(255,255,255,0.16), transparent 42%), radial-gradient(circle at 40% -30%, rgba(255,255,255,0.14), transparent 38%)',
          }}
        />
        <Box
          component="img"
          src={heroImage}
          alt=""
          sx={{
            position: 'absolute',
            right: { xs: -120, md: -10 },
            top: { xs: -115, md: -220 },
            width: { xs: 290, md: 460 },
            height: 'auto',
            opacity: 0.2,
            mixBlendMode: 'luminosity',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: '#FFFFFF',
              textAlign: 'center',
              fontFamily: 'Red Hat Display, Segoe UI, Helvetica Neue, Arial, sans-serif',
              fontSize: { xs: 28, md: 48 },
              fontWeight: 600,
              lineHeight: 1.5,
              letterSpacing: '0.1px',
              maxWidth: 824,
            }}
          >
            Where talent meets opportunity.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 537,
          mx: 'auto',
          mt: { xs: 6, md: 8 },
          px: { xs: 2, md: 0 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Typography
          sx={{
            color: '#03478C',
            fontFamily: 'Red Hat Display, Segoe UI, Helvetica Neue, Arial, sans-serif',
            fontSize: { xs: 21, md: 24 },
            fontWeight: 500,
            lineHeight: 1.5,
            letterSpacing: '0.1px',
            mb: 4,
          }}
        >
          Log in using your email and provided password.
        </Typography>

        <Stack spacing={3} component="form" onSubmit={handleSubmit(onSubmit)}>
          {submitError ? <Alert severity="error">{submitError}</Alert> : null}

          <TextField
            label="Email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email')}
            sx={{
              '& .MuiInputLabel-root': {
                fontFamily: 'Red Hat Text, Segoe UI, Helvetica Neue, Arial, sans-serif',
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password')}
            sx={{
              '& .MuiInputLabel-root': {
                fontFamily: 'Red Hat Text, Segoe UI, Helvetica Neue, Arial, sans-serif',
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              mt: 1,
              minHeight: 48,
              borderRadius: '999px',
              backgroundColor: '#03478C',
              textTransform: 'none',
              fontFamily: 'Red Hat Text, Segoe UI, Helvetica Neue, Arial, sans-serif',
              fontWeight: 500,
              fontSize: 16,
              letterSpacing: '0.1px',
              '&:hover': {
                backgroundColor: '#023466',
              },
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Log In'}
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          borderTop: '1px solid #E1E3E6',
          boxShadow: '0 -4px 4px rgba(0, 0, 0, 0.1)',
          bgcolor: '#FFFFFF',
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, md: 5 },
            py: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography
              sx={{
                color: '#03478C',
                fontFamily: 'Red Hat Display, Segoe UI, Helvetica Neue, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 24,
              }}
            >
              SkillsMine
            </Typography>
            <Typography
              sx={{
                color: '#03478C',
                fontFamily: 'Red Hat Text, Segoe UI, Helvetica Neue, Arial, sans-serif',
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: '0.1px',
              }}
            >
              © 2026
            </Typography>
          </Box>
          <Stack direction="row" spacing={4}>
            <Typography sx={{ color: '#03478C', fontWeight: 500 }}>Privacy</Typography>
            <Typography sx={{ color: '#03478C', fontWeight: 500 }}>Terms</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage
