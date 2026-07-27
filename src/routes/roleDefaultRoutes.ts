import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Role } from '@/types/auth'

export const roleToDefaultRoute: Record<Role, string> = {
  candidate: ROUTE_PATHS.candidateDashboard,
  recruiter: ROUTE_PATHS.recruiter,
  manco: ROUTE_PATHS.manco,
  exco: ROUTE_PATHS.exco,
  admin: ROUTE_PATHS.dashboard,
}