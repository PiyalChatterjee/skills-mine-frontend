import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Email is required').pipe(z.email('Enter a valid email')),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>