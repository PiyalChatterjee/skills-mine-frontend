import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { CandidateLayout } from "@/layouts/CandidateLayout";
import { ExcoLayout } from "@/layouts/ExcoLayout";
import { MancoLayout } from "@/layouts/MancoLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { OptionalCandidateLayout } from "@/layouts/OptionalCandidateLayout";
import { RecruiterLayout } from "@/layouts/RecruiterLayout";
import AuthCallbackPage from "@/modules/auth/pages/AuthCallbackPage";
import LoginPage from "@/modules/auth/pages/LoginPage";
import RecruiterSignupPage from "@/modules/auth/pages/RecruiterSignupPage";
import SignupPage from "@/modules/auth/pages/SignupPage";
import ResetPasswordPage from "@/modules/auth/pages/ResetPasswordPage.tsx";
import ProfileCreationPage from "@/modules/candidate/pages/ProfileCreationPage";
import LandingPage from "@/modules/public/pages/LandingPage";
import { PermissionGuard } from "@/routes/guards/PermissionGuard";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { RoleGuard } from "@/routes/guards/RoleGuard";
import { CandidateOnboardingGuard } from "@/routes/guards/CandidateOnboardingGuard";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "@/routes/AppRoutes.module.css";

const DashboardEntryPage = lazy(
  () => import("@/modules/dashboard/pages/DashboardEntryPage"),
);
const CandidateDashboardPage = lazy(
  () => import("@/modules/candidate/pages/CandidateDashboardPage"),
);
const CvBuilderPage = lazy(
  () => import("@/modules/cv-builder/pages/CvBuilderPage"),
);

const JobDetailsPage = lazy(
  () => import("@/modules/candidate/pages/JobDetailsPage"),
);
const JobSearchResultsPage = lazy(
  () => import("@/modules/candidate/pages/JobSearchResultsPage"),
);
const SavedJobsPage = lazy(
  () => import("@/modules/candidate/pages/SavedJobsPage"),
);
const LatestJobsPage = lazy(
  () => import("@/modules/candidate/pages/LatestJobsPage"),
);
const RecommendedJobsPage = lazy(
  () => import("@/modules/candidate/pages/RecommendedJobsPage"),
);
const ProfilePage = lazy(() => import("@/modules/candidate/pages/ProfilePage"));
const RecruiterPage = lazy(
  () => import("@/modules/recruiter/pages/RecruiterPage"),
);
const RecruiterMandatesPage = lazy(
  () => import("@/modules/recruiter/pages/RecruiterMandatesPage"),
);
const MandateDetailPage = lazy(
  () => import("@/modules/recruiter/pages/MandateDetailPage"),
);
const CandidatePipelinePage = lazy(
  () => import("@/modules/recruiter/pages/CandidatePipelinePage"),
);
const CandidateProfilePage = lazy(
  () => import("@/modules/recruiter/pages/CandidateProfilePage"),
);
const NewMandatePage = lazy(
  () => import("@/modules/recruiter/pages/NewMandatePage"),
);
const EditMandatePage = lazy(
  () => import("@/modules/recruiter/pages/EditMandatePage"),
);
const AdvertisedJobsPage = lazy(
  () => import("@/modules/recruiter/pages/AdvertisedJobsPage"),
);
const AdvertiseJobPage = lazy(
  () => import("@/modules/recruiter/pages/AdvertiseJobPage"),
);
const PnetPostPage = lazy(
  () => import("@/modules/recruiter/pages/PnetPostPage"),
);
const AdzunaPostPage = lazy(
  () => import("@/modules/recruiter/pages/AdzunaPostPage"),
);
const BizCommunityPostPage = lazy(
  () => import("@/modules/recruiter/pages/BizCommunityPostPage"),
);
const HarambeePostPage = lazy(
  () => import("@/modules/recruiter/pages/HarambeePostPage"),
);
const CandidatesPage = lazy(
  () => import("@/modules/recruiter/pages/CandidatesPage"),
);
const CandidateDetailPage = lazy(
  () => import("@/modules/recruiter/pages/CandidateDetailPage"),
);
const VisitorDetailPage = lazy(
  () => import("@/modules/recruiter/pages/VisitorDetailPage"),
);
const CandidateCvReviewPage = lazy(
  () => import("@/modules/recruiter/pages/CandidateCvReviewPage"),
);
const RecruiterCrmPage = lazy(
  () => import("@/modules/recruiter/pages/RecruiterCrmPage"),
);
const RecruiterMancoPage = lazy(
  () => import("@/modules/recruiter/pages/RecruiterMancoPage"),
);
const CrmPage = lazy(() => import("@/modules/crm/pages/CrmPage"));
const MancoPage = lazy(() => import("@/modules/manco/pages/MancoPage"));
const ExcoPage = lazy(() => import("@/modules/exco/pages/ExcoPage"));

const RouteFallback = () => (
  <div className={styles.fallbackContainer}>
    <span className={styles.loadingText}>Loading Content</span>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTE_PATHS.landing} element={<LandingPage />} />
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.authCallback} element={<AuthCallbackPage />} />
          <Route path="/callback" element={<AuthCallbackPage />} />
          <Route path={ROUTE_PATHS.signup} element={<SignupPage />} />
          <Route path={ROUTE_PATHS.recruiterSignup} element={<RecruiterSignupPage />} />
          <Route
            path={ROUTE_PATHS.resetPassword}
            element={<ResetPasswordPage />}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<CandidateLayout />}>
            <Route
              element={
                <RoleGuard
                  allowedRoles={["JOB_SEEKER"]}
                  fallbackPath={ROUTE_PATHS.dashboard}
                />
              }
            >
              <Route element={<CandidateOnboardingGuard />}>
                <Route
                  path={ROUTE_PATHS.candidateDashboard}
                  element={<CandidateDashboardPage />}
                />
              </Route>
              <Route
                path={ROUTE_PATHS.profileCreation}
                element={<ProfileCreationPage />}
              />
            </Route>
            <Route element={<CandidateOnboardingGuard />}>
              <Route path={ROUTE_PATHS.savedJobs} element={<SavedJobsPage />} />
              <Route path={ROUTE_PATHS.latestJobs} element={<LatestJobsPage />} />
              <Route
                path={ROUTE_PATHS.recommendedJobs}
                element={<RecommendedJobsPage />}
              />
              <Route path={ROUTE_PATHS.profile} element={<ProfilePage />} />
            </Route>
          </Route>

          <Route element={<RecruiterLayout />}>
            <Route
              element={
                <RoleGuard allowedRoles={["RECRUITER"]} />
              }
            >
              <Route
                path={ROUTE_PATHS.recruiterDashboard}
                element={<RecruiterPage />}
              />
            <Route
              path={ROUTE_PATHS.recruiterJobPosts}
              element={<RecruiterMandatesPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterNewJobPost}
              element={<NewMandatePage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterEditJobPost}
              element={<EditMandatePage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertisedJobs}
              element={<AdvertisedJobsPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertiseJob}
              element={<AdvertiseJobPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertisePnet}
              element={<PnetPostPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertiseAdzuna}
              element={<AdzunaPostPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertiseBizCommunity}
              element={<BizCommunityPostPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterAdvertiseHarambee}
              element={<HarambeePostPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterMandate}
              element={<MandateDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidatePipeline}
              element={<CandidatePipelinePage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidate}
              element={<CandidateProfilePage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidates}
              element={<CandidatesPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidateDetail}
              element={<CandidateDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterVisitorDetail}
              element={<VisitorDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidateCvReview}
              element={<CandidateCvReviewPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterVisitorCvReview}
              element={<CandidateCvReviewPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCandidateJobDetail}
              element={<MandateDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterVisitorJobDetail}
              element={<MandateDetailPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterCrm}
              element={<RecruiterCrmPage />}
            />
            <Route
              path={ROUTE_PATHS.recruiterManco}
              element={<RecruiterMancoPage />}
            />
              <Route
                path={ROUTE_PATHS.recruiterMancoPipeline}
                element={<RecruiterPage />}
              />
            </Route>
            <Route
              element={<PermissionGuard requiredPermissions={["CRM_EDIT"]} />}
            >
              <Route path={ROUTE_PATHS.crm} element={<CrmPage />} />
            </Route>
          </Route>

          <Route element={<MancoLayout />}>
            <Route element={<RoleGuard allowedRoles={["MANCO", "ADMIN"]} />}>
              <Route path={ROUTE_PATHS.manco} element={<MancoPage />} />
            </Route>
          </Route>

          <Route element={<ExcoLayout />}>
            <Route element={<RoleGuard allowedRoles={["EXCO", "ADMIN"]} />}>
              <Route path={ROUTE_PATHS.exco} element={<ExcoPage />} />
              <Route
                path={ROUTE_PATHS.excoCrm}
                element={<RecruiterCrmPage navigation="exco" />}
              />
            </Route>
          </Route>

          <Route element={<AdminLayout />}>
            <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
              <Route
                path={ROUTE_PATHS.dashboard}
                element={<DashboardEntryPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route element={<OptionalCandidateLayout />}>
          <Route path={ROUTE_PATHS.jobSearch} element={<JobSearchResultsPage />} />
          <Route path={ROUTE_PATHS.jobDetails} element={<JobDetailsPage />} />
          <Route element={<CandidateOnboardingGuard requireCv={false} />}>
            <Route path={ROUTE_PATHS.cvBuilder} element={<CvBuilderPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={ROUTE_PATHS.landing} replace />}
        />
      </Routes>
    </Suspense>
  );
};
