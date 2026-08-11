import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Role } from '@/types/auth'

export const roleToDefaultRoute: Record<Role, string> = {
  JOB_SEEKER: ROUTE_PATHS.candidateDashboard,
  RECRUITER: ROUTE_PATHS.recruiter,
  MANCO: ROUTE_PATHS.manco,
  EXCO: ROUTE_PATHS.exco,
  ADMIN: ROUTE_PATHS.dashboard,
}