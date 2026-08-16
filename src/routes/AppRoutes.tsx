import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/layouts/AdminLayout'
import { CandidateLayout } from '@/layouts/CandidateLayout'
import { ExcoLayout } from '@/layouts/ExcoLayout'
import { MancoLayout } from '@/layouts/MancoLayout'
import { PublicLayout } from '@/layouts/PublicLayout'
import { RecruiterLayout } from '@/layouts/RecruiterLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import SignupPage from '@/modules/auth/pages/SignupPage'
import LandingPage from '@/modules/public/pages/LandingPage'
import { PortalRoute } from '@/routes/PortalRoute'
import { PermissionGuard } from '@/routes/guards/PermissionGuard'
import { ProtectedRoute } from '@/routes/guards/ProtectedRoute'
import { RoleGuard } from '@/routes/guards/RoleGuard'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from '@/routes/AppRoutes.module.css'

const DashboardEntryPage = lazy(
  () => import('@/modules/dashboard/pages/DashboardEntryPage'),
)
const CandidateDashboardPage = lazy(
  () => import('@/modules/candidate/pages/CandidateDashboardPage'),
)
const CvBuilderPage = lazy(() => import('@/modules/cv-builder/pages/CvBuilderPage'))
const JobsPage = lazy(() => import('@/modules/candidate/pages/JobsPage'))
const ProfilePage = lazy(() => import('@/modules/candidate/pages/ProfilePage'))
const RecruiterPage = lazy(() => import('@/modules/recruiter/pages/RecruiterPage'))
const RecruiterMandatesPage = lazy(() => import('@/modules/recruiter/pages/RecruiterMandatesPage'))
const MandateDetailPage = lazy(() => import('@/modules/recruiter/pages/MandateDetailPage'))
const CandidateProfilePage = lazy(() => import('@/modules/recruiter/pages/CandidateProfilePage'))
const NewMandatePage = lazy(() => import('@/modules/recruiter/pages/NewMandatePage'))
const EditMandatePage = lazy(() => import('@/modules/recruiter/pages/EditMandatePage'))
const CandidatesPage = lazy(() => import('@/modules/recruiter/pages/CandidatesPage'))
const CandidateDetailPage = lazy(() => import('@/modules/recruiter/pages/CandidateDetailPage'))
const RecruiterCrmPage = lazy(() => import('@/modules/recruiter/pages/RecruiterCrmPage'))
const CrmPage = lazy(() => import('@/modules/crm/pages/CrmPage'))
const MancoPage = lazy(() => import('@/modules/manco/pages/MancoPage'))
const ExcoPage = lazy(() => import('@/modules/exco/pages/ExcoPage'))

const RouteFallback = () => (
  <div className={styles.fallbackContainer}>
    <span className={styles.loadingText}>Loading Content</span>
  </div>
)

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTE_PATHS.landing} element={<LandingPage />} />
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.signup} element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<PortalRoute />}>
            <Route path={ROUTE_PATHS.portal} element={<RouteFallback />} />
          </Route>

          <Route element={<CandidateLayout />}>
            <Route element={<RoleGuard allowedRoles={['JOB_SEEKER']} fallbackPath={ROUTE_PATHS.dashboard} />}>
              <Route path={ROUTE_PATHS.candidateDashboard} element={<CandidateDashboardPage />} />
              <Route path={ROUTE_PATHS.cvBuilder} element={<CvBuilderPage />} />
            </Route>
            <Route path={ROUTE_PATHS.jobs} element={<JobsPage />} />
            <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
          </Route>

          <Route element={<RecruiterLayout />}>
            <Route path={ROUTE_PATHS.recruiter} element={<RecruiterPage />} />
            <Route path={ROUTE_PATHS.recruiterJobPosts} element={<RecruiterMandatesPage />} />
            <Route path={ROUTE_PATHS.recruiterNewJobPost} element={<NewMandatePage />} />
            <Route path={ROUTE_PATHS.recruiterEditJobPost} element={<EditMandatePage />} />
            <Route path={ROUTE_PATHS.recruiterMandate} element={<MandateDetailPage />} />
            <Route path={ROUTE_PATHS.recruiterCandidate} element={<CandidateProfilePage />} />
            <Route path={ROUTE_PATHS.recruiterCandidates} element={<CandidatesPage />} />
            <Route path={ROUTE_PATHS.recruiterCandidateDetail} element={<CandidateDetailPage />} />
            <Route path={ROUTE_PATHS.recruiterCrm} element={<RecruiterCrmPage />} />
            <Route
              element={
                <PermissionGuard requiredPermissions={['CRM_EDIT']} />
              }
            >
              <Route path={ROUTE_PATHS.crm} element={<CrmPage />} />
            </Route>
          </Route>

          <Route element={<MancoLayout />}>
            <Route element={<RoleGuard allowedRoles={['MANCO', 'ADMIN']} />}>
              <Route path={ROUTE_PATHS.manco} element={<MancoPage />} />
            </Route>
          </Route>

          <Route element={<ExcoLayout />}>
            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path={ROUTE_PATHS.exco} element={<ExcoPage />} />
            </Route>
          </Route>

          <Route element={<AdminLayout />}>
            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path={ROUTE_PATHS.dashboard} element={<DashboardEntryPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTE_PATHS.landing} replace />} />
      </Routes>
    </Suspense>
  )
}
