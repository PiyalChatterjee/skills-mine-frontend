import { z } from 'zod'

const jwtPayloadSchema = z.object({
  sub: z.string().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  email: z.string().optional(),
  role: z.string().optional(),
  permissions: z.array(z.string()).optional(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>

export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(normalized)
    return jwtPayloadSchema.parse(JSON.parse(decoded))
  } catch {
    return null
  }
}

export const isJwtExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return false
  const nowInSeconds = Math.floor(Date.now() / 1000)
  return payload.exp <= nowInSeconds
}
