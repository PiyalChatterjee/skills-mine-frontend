# API Migration Report (Frontend -> SkillsMine v2 Contract)

## Scope
Authoritative source: `API_ARCHITECTURE.md` (provided).

This migration updated the frontend API integration layer, auth flow contracts, candidate profile/dashboard/CV mappings, jobs integration, recruiter stage enums, and shared DTOs/types to align with the v2 backend contract.

## Phase 1: API Impact Analysis

### 1) Authentication
- OLD ENDPOINT: env-driven endpoints in `authApi` (`VITE_AUTH_LOGIN_ENDPOINT`, `VITE_AUTH_SIGNUP_ENDPOINT`, `VITE_AUTH_ME_ENDPOINT`, `VITE_AUTH_LOGOUT_ENDPOINT`) plus recruiter-specific signup endpoint.
- NEW ENDPOINTS:
  - `POST /auth/login`
  - `POST /auth/register`
  - `POST /auth/logout`
  - `POST /auth/forgot-password`
  - `POST /auth/change-password`
- OLD REQUEST:
  - Login: `{ email, password }`
  - Signup: `{ firstName, lastName, email, phoneNumber, password, confirmPassword, passwordHint, termsAccepted }`
- NEW REQUEST:
  - Login: `{ username, password, rememberMe? }`
  - Register: `{ userType?, firstName, lastName, email, mobileNumber?, password, confirmPassword, acceptTerms?, acceptPrivacyPolicy? }`
- OLD RESPONSE:
  - Login: `{ token, user, expiresIn }`
- NEW RESPONSE:
  - Login envelope with `data.accessToken`, `data.refreshToken`, `data.expiresIn`, `data.profileCompleted`, `data.roles`
- BREAKING CHANGES:
  - `email` -> `username` for login
  - token fields changed
  - role format changed to enum values (`JOB_SEEKER`, `RECRUITER`, `MANCO`, `ADMIN`)
- FILES IMPACTED:
  - `src/services/api/authApi.ts`
  - `src/types/auth.ts`
  - `src/modules/auth/types/login.ts`
  - `src/modules/auth/types/signup.ts`
  - `src/modules/auth/pages/LoginPage.tsx`
  - `src/modules/auth/pages/SignupPage.tsx`
  - `src/app/auth/jwt.ts`
  - `src/app/validation.schema.ts`
  - `src/modules/public/components/SignUpDrawer.types.ts`
  - `src/modules/public/components/CandidateSignUpDrawer.types.ts`
  - `src/modules/public/components/SignUpForm.tsx`
  - `src/modules/public/components/CandidateSignUpForm.tsx`
  - `src/modules/public/hooks/useCandidateSignUpForm.ts`
  - `src/modules/public/hooks/useRecruiterSignUpForm.ts`
- SCREENS IMPACTED:
  - Login
  - Signup
  - Public signup drawers (candidate/recruiter)

### 2) User Profile / Candidate Profile
- OLD ENDPOINTS:
  - `GET /candidates/:candidateId`
  - `PUT /candidates/:candidateId`
- NEW ENDPOINTS:
  - `GET /users/:userId`
  - `PUT /users/:userId`
  - `POST /users/:userId/profile-photo`
  - `DELETE /users/:userId/profile-photo`
- OLD RESPONSE: flat `CandidateProfile`
- NEW RESPONSE: nested structure with `personalDetails`, `desiredJob`, `education`, `experience`
- BREAKING CHANGES:
  - identifier basis changed from `candidateId` to `userId` for profile routes
  - profile image moved under `personalDetails.profileImageUrl`
  - payload is section-based partial update
- FILES IMPACTED:
  - `src/services/api/candidateApi.ts`
  - `src/types/api.ts`
  - `src/modules/candidate/types/candidate.ts`
  - `src/modules/candidate/pages/profileForm.config.ts`
  - `src/modules/candidate/pages/ProfilePage.tsx`
  - `src/store/api/apiSlice.ts`
  - `src/store/slices/candidateThunks.ts`
  - `src/layouts/CandidateLayout.tsx`
- SCREENS IMPACTED:
  - Profile settings
  - Candidate layout preload flow

### 3) Candidate Dashboard
- OLD SOURCE: composed from profile + per-application calls (`/candidates/applications/:id`)
- NEW ENDPOINT:
  - `GET /candidate/dashboard`
- BREAKING CHANGES:
  - response is pre-aggregated (`summary`, `activity`, `applications`, `quickLinks`)
- FILES IMPACTED:
  - `src/store/api/apiSlice.ts`
  - `src/modules/candidate/hooks/useCandidateQueries.ts`
  - `src/modules/candidate/pages/CandidateDashboardPage.tsx`
- SCREENS IMPACTED:
  - Candidate dashboard widgets

### 4) CV Builder
- OLD SOURCE: CV completion wrote back to legacy candidate flat model
- NEW ENDPOINTS:
  - `POST /candidate/buildmycv`
  - `POST /applications/:applicationId/cv/upload`
  - `GET /candidate/:resumeId/preview`
  - `GET /candidate/:resumeId/download`
- BREAKING CHANGES:
  - profile persistence now writes nested `personalDetails/desiredJob/education/experience/languages`
- FILES IMPACTED:
  - `src/services/api/candidateApi.ts`
  - `src/modules/cv-builder/hooks/useCvBuilderDone.ts`
  - `src/modules/cv-builder/pages/CvBuilderPage.tsx`
- SCREENS IMPACTED:
  - CV builder save/prefill flow

### 5) Jobs
- OLD ENDPOINT: `GET /jobs` with legacy query param mapping (`query`, `pageSize` fallback handling)
- NEW ENDPOINTS:
  - `GET /jobs` (`q`, `status`, `page`, `limit`)
  - `POST /jobs/:jobId/save`
  - `POST /jobs/:jobId/apply`
- BREAKING CHANGES:
  - query param normalization to v2 (`q`, `limit`)
  - response normalization to `data.jobs + pagination`
- FILES IMPACTED:
  - `src/services/api/jobsApi.ts`
  - `src/types/api.ts`
  - `src/types/jobs.ts`
  - `src/modules/public/pages/LandingPage.tsx`
- SCREENS IMPACTED:
  - Landing opportunities cards
  - Jobs data loaders

### 6) Recruiter / Mandates / Pipeline / ATS
- OLD ENDPOINT: `GET /mandates` only (summary)
- NEW ENDPOINTS:
  - `GET /recruiter/dashboard`
  - `GET /recruiter/mandates`
  - `GET /mandates/:mandateId`
  - `GET /applications/:applicationId/stage-transition`
  - `PUT /recruiter/applications/:applicationId/stage`
  - `GET /recruiter/candidates/search`
  - `GET /api/v1/candidates/:candidateId/profile`
  - `PATCH /api/v1/pipeline/:pipelineId/stage`
- BREAKING CHANGES:
  - richer envelopes and strict stage names
  - pipeline stage naming aligned to v2 (`Shortlisted`, `Placed`)
- FILES IMPACTED:
  - `src/services/api/mandateApi.ts`
  - `src/modules/recruiter/types/recruiter.ts`
  - `src/modules/recruiter/data/mockData.ts`
  - `src/modules/recruiter/pages/RecruiterPage.tsx`
  - `src/modules/recruiter/pages/CandidateProfilePage.tsx`
  - `src/workflow/workflow.types.ts`
  - `src/workflow/workflow.config.ts`
- SCREENS IMPACTED:
  - Recruiter dashboard stage model
  - Candidate profile stage badge map

### 7) CRM
- OLD ENDPOINT:
  - `GET /crm/accounts`
- NEW ENDPOINTS:
  - `GET /api/v1/crm/clients`
  - `POST /api/v1/crm/clients/:clientId/notes`
- FILES IMPACTED:
  - `src/services/api/crmApi.ts`
  - `src/routes/AppRoutes.tsx` (permission token alignment)
- SCREENS IMPACTED:
  - CRM screen service layer wiring (screen remains placeholder)

### 8) MANCO
- NEW ENDPOINTS ADDED TO SERVICE LAYER:
  - `GET /api/v1/manco/:mancoId/dashboard`
  - `GET /api/manco/recruiters/:id/performance`
- FILES IMPACTED:
  - `src/services/api/mandateApi.ts`
- SCREENS IMPACTED:
  - Manco/analytics screens can now wire to contract-ready service methods

## Phase 2: API Layer Refactor (Completed)
Updated service modules:
- `src/services/api/authApi.ts`
- `src/services/api/candidateApi.ts`
- `src/services/api/jobsApi.ts`
- `src/services/api/mandateApi.ts`
- `src/services/api/crmApi.ts`
- `src/services/api/index.ts`

Removed deprecated service:
- `src/services/api/dashboardApi.ts`

## Phase 3: TypeScript Types (Completed)
- Rebuilt central API DTO model in `src/types/api.ts`
- Rebuilt auth DTO/enums in `src/types/auth.ts`
- Candidate module types now re-export v2 models in `src/modules/candidate/types/candidate.ts`
- Pipeline/workflow stage enums aligned (`Shortlisted`, `Placed`)

## Phase 4-15 Coverage Summary
- Auth flow updated (login/register/logout + models)
- Profile flow updated to `/users/:userId`
- Candidate dashboard updated to `/candidate/dashboard`
- CV builder save mapping updated to nested profile payloads
- Jobs API integration updated
- Recruiter/CRM/MANCO service layer endpoints added/refactored
- State management updated in RTK Query (`apiSlice`) and thunks
- Validation updated to match auth payload contract
- Error mapping kept centralized (`queryErrorHandler` + `withMappedApiError`)

## Phase 16: Testing and Validation
- Build validation executed successfully after migration.
- Command: `npm run -s build`
- Result: success

## Post-Migration Follow-Up: Candidate Onboarding Routing

### What Happened
- Candidate registration returned `201 Created`, login returned `200 OK`, and current-user lookup also succeeded, but some signup-to-login journeys still landed back on `/login` instead of continuing into candidate onboarding.
- The issue was most visible for new `JOB_SEEKER` accounts that should have been taken to `/profile/create` immediately after their first successful login.

### Root Cause
- The frontend still had an architecture shaped around an intermediate `/portal` redirect and guard-driven role resolution.
- During the first render after login, route guards could evaluate before `AuthContext` had fully rehydrated from persisted storage.
- That timing gap made protected candidate routes treat the session as unauthenticated or missing a role for a moment, causing redirect churn and occasional bounce-back to `/login`.

### Final Frontend Behavior
- Candidate sign-up success redirects to `/login` (no onboarding localStorage key or query-string intent).
- After login succeeds, `LoginPage` performs role-first routing:
  - non-candidate roles go straight to their role default route
  - `JOB_SEEKER` users fetch candidate profile data and run a profile-completeness check
- If candidate profile data is incomplete, the app navigates to `/profile/create`.
- If candidate profile data is complete, the app navigates to `/candidate/dashboard`.
- Active `/portal` route wiring was removed from `AppRoutes`.
- Profile creation persistence now occurs on final `Done` only (intermediate steps are local-only).

### Code-Level Safeguards Added
- `ProtectedRoute` now accepts a valid persisted access token from `tokenStorage` as a temporary fallback while auth context hydrates.
- `RoleGuard` now accepts a persisted user role from `tokenStorage` for the same hydration window.
- This keeps protected navigation stable without changing the long-term source of truth, which remains `AuthContext`.

### Verification
- Build passed after the guard changes.
- A fresh candidate sign-up and login flow was exercised in the browser.
- Verified final URL: `/profile/create`.
- Verified page content: `Create your profile` and `Let’s create your profile.`.

## Deprecated/Obsolete Code Removed
- `src/services/api/dashboardApi.ts` removed
- Legacy candidate applications query endpoint usage removed from RTK Query
- Legacy auth payload fields removed from forms/types (`passwordHint`, `termsAccepted`, `phoneNumber`)

## Files Modified
- `src/app/auth/jwt.ts`
- `src/app/validation.schema.ts`
- `src/layouts/CandidateLayout.tsx`
- `src/layouts/headerNav.ts`
- `src/modules/auth/pages/LoginPage.tsx`
- `src/modules/auth/pages/SignupPage.tsx`
- `src/modules/auth/types/login.ts`
- `src/modules/auth/types/signup.ts`
- `src/modules/candidate/hooks/useCandidateQueries.ts`
- `src/modules/candidate/pages/CandidateDashboardPage.tsx`
- `src/modules/candidate/pages/ProfilePage.tsx`
- `src/modules/candidate/pages/profileForm.config.ts`
- `src/modules/candidate/types/candidate.ts`
- `src/modules/cv-builder/hooks/useCvBuilderDone.ts`
- `src/modules/cv-builder/pages/CvBuilderPage.tsx`
- `src/modules/public/components/CandidateSignUpDrawer.types.ts`
- `src/modules/public/components/CandidateSignUpForm.tsx`
- `src/modules/public/components/SignUpDrawer.types.ts`
- `src/modules/public/components/SignUpForm.tsx`
- `src/modules/public/hooks/useCandidateSignUpForm.ts`
- `src/modules/public/hooks/useRecruiterSignUpForm.ts`
- `src/modules/public/pages/LandingPage.tsx`
- `src/modules/recruiter/data/mockData.ts`
- `src/modules/recruiter/pages/CandidateProfilePage.tsx`
- `src/modules/recruiter/pages/NewMandatePage.tsx`
- `src/modules/recruiter/pages/RecruiterPage.tsx`
- `src/modules/recruiter/types/recruiter.ts`
- `src/routes/AppRoutes.tsx`
- `src/routes/roleDefaultRoutes.ts`
- `src/services/api/authApi.ts`
- `src/services/api/candidateApi.ts`
- `src/services/api/crmApi.ts`
- `src/services/api/index.ts`
- `src/services/api/jobsApi.ts`
- `src/services/api/mandateApi.ts`
- `src/store/api/apiSlice.ts`
- `src/store/slices/candidateThunks.ts`
- `src/types/api.ts`
- `src/types/auth.ts`
- `src/types/jobs.ts`
- `src/workflow/workflow.config.ts`
- `src/workflow/workflow.types.ts`

## Remaining Manual Actions
1. Wire placeholder pages to new APIs (currently placeholders by design):
   - `src/modules/crm/pages/CrmPage.tsx`
   - `src/modules/manco/pages/MancoPage.tsx`
   - `src/modules/candidate/pages/JobsPage.tsx`
2. Implement explicit UI flows for:
   - `forgot password` and `change password` screens/forms
   - profile photo upload/delete UI actions using newly added service methods
   - CV upload/preview/download action buttons using new candidate API methods
3. Expand unit/integration tests and MSW fixtures for all new envelopes and status-code handling (current repo has minimal test coverage).
