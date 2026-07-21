import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { CandidateLayout } from '@/layouts/CandidateLayout'
import { ExcoLayout } from '@/layouts/ExcoLayout'
import { MancoLayout } from '@/layouts/MancoLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RecruiterLayout } from '@/layouts/RecruiterLayout'
import { PortalRoute } from '@/routes/PortalRoute'
import { PermissionGuard } from '@/routes/guards/PermissionGuard'
import { ProtectedRoute } from '@/routes/guards/ProtectedRoute'
import { RoleGuard } from '@/routes/guards/RoleGuard'
import { ROUTE_PATHS } from '@/routes/routePaths'

const LoginPage = lazy(() => import('@/modules/auth/pages/LoginPage'))
const DashboardEntryPage = lazy(
  () => import('@/modules/dashboard/pages/DashboardEntryPage'),
)
const JobsPage = lazy(() => import('@/modules/candidate/pages/JobsPage'))
const ProfilePage = lazy(() => import('@/modules/candidate/pages/ProfilePage'))
const RecruiterPage = lazy(() => import('@/modules/recruiter/pages/RecruiterPage'))
const CrmPage = lazy(() => import('@/modules/crm/pages/CrmPage'))
const MancoPage = lazy(() => import('@/modules/manco/pages/MancoPage'))
const ExcoPage = lazy(() => import('@/modules/exco/pages/ExcoPage'))

const RouteFallback = () => <div>Loading route...</div>

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalRoute />}>
            <Route path="/" element={<RouteFallback />} />
          </Route>

          <Route element={<CandidateLayout />}>
            <Route path={ROUTE_PATHS.jobs} element={<JobsPage />} />
            <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
          </Route>

          <Route element={<RecruiterLayout />}>
            <Route path={ROUTE_PATHS.recruiter} element={<RecruiterPage />} />
            <Route
              element={
                <PermissionGuard requiredPermissions={['CRM_VIEW']} />
              }
            >
              <Route path={ROUTE_PATHS.crm} element={<CrmPage />} />
            </Route>
          </Route>

          <Route element={<MancoLayout />}>
            <Route element={<RoleGuard allowedRoles={['manco', 'admin']} />}>
              <Route path={ROUTE_PATHS.manco} element={<MancoPage />} />
            </Route>
          </Route>

          <Route element={<ExcoLayout />}>
            <Route element={<RoleGuard allowedRoles={['exco', 'admin']} />}>
              <Route path={ROUTE_PATHS.exco} element={<ExcoPage />} />
            </Route>
          </Route>

          <Route element={<AdminLayout />}>
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path={ROUTE_PATHS.dashboard} element={<DashboardEntryPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
      </Routes>
    </Suspense>
  )
}
