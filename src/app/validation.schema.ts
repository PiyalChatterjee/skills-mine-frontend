import { z } from 'zod'

export const idSchema = z.string().min(1)

export const emailSchema = z.string().pipe(z.email())
