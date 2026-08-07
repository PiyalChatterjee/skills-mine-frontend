# SkillsMine Frontend – Architecture Reference

> **Audience:** developers contributing to or onboarding into this codebase.
> This document describes the current runtime architecture, API contract integration, state management decisions, route guards, auth session model, and environment configuration system.

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Application Bootstrap](#2-application-bootstrap)
3. [Route Architecture & Access Guards](#3-route-architecture--access-guards)
4. [Auth System](#4-auth-system)
5. [API Layer Architecture](#5-api-layer-architecture)
6. [Endpoint Configuration System](#6-endpoint-configuration-system)
7. [State Management](#7-state-management)
8. [Module Structure](#8-module-structure)
9. [Data Flow: Candidate Profile](#9-data-flow-candidate-profile)
10. [Data Flow: Login & Session Establishment](#10-data-flow-login--session-establishment)
11. [Environment Variable Catalog](#11-environment-variable-catalog)
12. [Error Handling Strategy](#12-error-handling-strategy)
13. [Key Design Decisions](#13-key-design-decisions)

---

## 1. High-Level System Overview

```mermaid
graph TD
    Browser["Browser (React 19 SPA)"]
    Vite["Vite Dev Server / Built Assets"]
    MockServer["SkillsMine Mock Server\nhttp://localhost:4000"]
    SessionStorage["sessionStorage\nskillsmine.auth.*"]

    Browser -->|"HTTP requests via Axios"| MockServer
    Browser -->|"Session tokens & user"| SessionStorage
    Vite -->|"Bundles & serves"| Browser
```

The application is a React 19 SPA. There is no server-side rendering. All routing is client-side. The backend API base URL is configurable via `VITE_API_BASE_URL`.

---

## 2. Application Bootstrap

The app mounts in [src/main.tsx](src/main.tsx) and wraps the component tree with a single `AppProviders` composable.

```mermaid
graph TD
    main["main.tsx\nReactDOM.createRoot"]
    AppProviders["AppProviders"]
    GoogleOAuth["GoogleOAuthProvider\n(only if VITE_GOOGLE_CLIENT_ID is set)"]
    ReduxProvider["Provider (Redux store)"]
    BrowserRouter["BrowserRouter"]
    AuthProvider["AuthProvider\n(session rehydration on mount)"]
    ThemeProvider["ThemeProvider (MUI)"]
    AppRoutes["AppRoutes"]
    NotificationToaster["NotificationToaster"]

    main --> AppProviders
    AppProviders --> GoogleOAuth
    GoogleOAuth --> ReduxProvider
    ReduxProvider --> BrowserRouter
    BrowserRouter --> AuthProvider
    AuthProvider --> ThemeProvider
    ThemeProvider --> AppRoutes
    ThemeProvider --> NotificationToaster
```

**Files:**
- [`src/main.tsx`](src/main.tsx)
- [`src/app/AppProviders.tsx`](src/app/AppProviders.tsx)

`GoogleOAuthProvider` is conditionally applied — if `VITE_GOOGLE_CLIENT_ID` is absent the tree renders without it rather than crashing.

---

## 3. Route Architecture & Access Guards

```mermaid
graph TD
    Root["/ (wildcard → /)"]

    PublicLayout["PublicLayout"]
    Landing["/ – LandingPage"]
    Login["/login – LoginPage"]
    Signup["/signup – SignupPage"]

    ProtectedRoute["ProtectedRoute\n(JWT expiry check)"]
    PortalRoute["/portal – PortalRoute\n(role redirect)"]

    CandidateLayout["CandidateLayout"]
    RoleGuardJobs["RoleGuard: JOB_SEEKER"]
    CandidateDashboard["/candidate/dashboard"]
    CvBuilder["/candidate/cv-builder"]
    Jobs["/jobs"]
    Profile["/profile"]

    RecruiterLayout["RecruiterLayout"]
    Recruiter["/recruiter"]
    NewMandate["/recruiter/new-mandate"]
    MandateDetail["/recruiter/mandate/:cardId"]
    CandidateProfile["/recruiter/mandate/:cardId/candidate/:candidateId"]
    PermGuardCRM["PermissionGuard: CRM_EDIT"]
    CRM["/crm"]

    MancoLayout["MancoLayout"]
    RoleGuardManco["RoleGuard: MANCO | ADMIN"]
    Manco["/manco"]

    ExcoLayout["ExcoLayout"]
    RoleGuardExco["RoleGuard: ADMIN"]
    Exco["/exco"]

    AdminLayout["AdminLayout"]
    RoleGuardAdmin["RoleGuard: ADMIN"]
    Dashboard["/dashboard"]

    Root --> PublicLayout
    PublicLayout --> Landing
    PublicLayout --> Login
    PublicLayout --> Signup

    Root --> ProtectedRoute
    ProtectedRoute --> PortalRoute
    PortalRoute --> CandidateLayout

    CandidateLayout --> RoleGuardJobs
    RoleGuardJobs --> CandidateDashboard
    RoleGuardJobs --> CvBuilder
    CandidateLayout --> Jobs
    CandidateLayout --> Profile

    ProtectedRoute --> RecruiterLayout
    RecruiterLayout --> Recruiter
    RecruiterLayout --> NewMandate
    RecruiterLayout --> MandateDetail
    RecruiterLayout --> CandidateProfile
    RecruiterLayout --> PermGuardCRM
    PermGuardCRM --> CRM

    ProtectedRoute --> MancoLayout
    MancoLayout --> RoleGuardManco
    RoleGuardManco --> Manco

    ProtectedRoute --> ExcoLayout
    ExcoLayout --> RoleGuardExco
    RoleGuardExco --> Exco

    ProtectedRoute --> AdminLayout
    AdminLayout --> RoleGuardAdmin
    RoleGuardAdmin --> Dashboard
```

### Guard Hierarchy

| Guard | File | Behaviour |
|---|---|---|
| `ProtectedRoute` | `src/routes/guards/ProtectedRoute.tsx` | Redirects to `/login` when not authenticated or JWT is expired. Preserves `from` location in state. |
| `PortalRoute` | `src/routes/PortalRoute.tsx` | On `/portal`, reads user role and immediately redirects to the role's default landing route. |
| `RoleGuard` | `src/routes/guards/RoleGuard.tsx` | Restricts a subtree to specific roles. Falls through to a configurable `fallbackPath`. |
| `PermissionGuard` | `src/routes/guards/PermissionGuard.tsx` | Restricts a subtree to specific permission tokens derived from role. |

### Role → Default Route

```
JOB_SEEKER  → /candidate/dashboard
RECRUITER   → /recruiter
MANCO       → /manco
ADMIN       → /dashboard
```

Defined in [`src/routes/roleDefaultRoutes.ts`](src/routes/roleDefaultRoutes.ts).

---

## 4. Auth System

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant authApi
    participant MockServer
    participant tokenStorage
    participant AuthContext

    User->>LoginPage: Submit email + password
    LoginPage->>authApi: login({ username, password })
    authApi->>MockServer: POST /auth/login
    MockServer-->>authApi: { accessToken, refreshToken, roles, profileCompleted }
    authApi-->>LoginPage: LoginResponse
    LoginPage->>authApi: mapLoginResponseToSession(response)
    Note over authApi: Decode JWT payload<br/>Derive permissions from roles
    authApi-->>LoginPage: { user: AuthUser, tokens: JwtTokens }
    LoginPage->>AuthContext: login(payload)
    AuthContext->>tokenStorage: setTokens + setUser → sessionStorage
    AuthContext->>AuthContext: setSession (isAuthenticated = true)
    LoginPage->>Router: navigate(/portal)
    Router->>PortalRoute: role-based redirect
```

### Session Storage Layout

| Key | Storage | Content |
|---|---|---|
| `skillsmine.auth.tokens` | `sessionStorage` | `{ accessToken, refreshToken }` |
| `skillsmine.auth.user` | `sessionStorage` | `AuthUser` object |

**Rehydration:** `AuthProvider` reads both keys on mount. If the access token is expired (checked via `isJwtExpired`), both keys are cleared and the user remains unauthenticated.

**Logout:** Clears both storage keys and resets the RTK Query cache via `apiSlice.util.resetApiState()`.

### Permission Model

Permissions are derived from roles at login time by `normalizePermissions` in [`src/services/api/authApi.ts`](src/services/api/authApi.ts). Roles → permission sets:

| Role | Permissions |
|---|---|
| `JOB_SEEKER` | VIEW_JOBS, APPLY_JOB, UPLOAD_CV, VIEW_DASHBOARD |
| `RECRUITER` | MANDATE_CREATE, MANDATE_EDIT, PIPELINE_ADVANCE, CRM_EDIT, CANDIDATE_VIEW, VIEW_DASHBOARD |
| `MANCO` | PIPELINE_VIEW, REPORT_VIEW, RECRUITER_VIEW, VIEW_DASHBOARD |
| `ADMIN` | ALL (expands to every permission) |

### Google OAuth

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant GoogleOAuthProvider
    participant authApi
    participant MockServer
    participant AuthContext

    User->>LoginPage: Click "Sign in with Google"
    LoginPage->>GoogleOAuthProvider: useGoogleLogin (implicit flow)
    GoogleOAuthProvider-->>LoginPage: TokenResponse { access_token }
    LoginPage->>authApi: exchangeGoogleToken({ accessToken })
    authApi->>MockServer: POST /auth/google/exchange
    MockServer-->>authApi: LoginResponse (same shape as /auth/login)
    authApi-->>LoginPage: session payload
    LoginPage->>AuthContext: login(payload)
    AuthContext->>AuthContext: session established
```

---

## 5. API Layer Architecture

```mermaid
graph TD
    Page["Page / Hook"]
    RTKQuery["RTK Query endpoint\nsrc/store/api/apiSlice.ts"]
    ServiceModule["Service module\nsrc/services/api/*.ts"]
    EndpointConfig["apiEndpoints + resolveEndpoint\nsrc/services/api/endpoints.ts"]
    AxiosClient["apiClient (Axios)\nsrc/services/api/axios.ts"]
    MockServer["Mock Server\nlocalhost:4000/api"]

    Page -->|"useGetCandidateProfileQuery\nuseGetCandidateDashboardQuery\nuseLazyListJobsPageQuery"| RTKQuery
    RTKQuery -->|"queryFn (withMappedApiError)"| ServiceModule
    Page -->|"Direct: crmApi, mandateApi,\ncandidateApi, authApi"| ServiceModule
    ServiceModule -->|"resolveEndpoint(template, params)"| EndpointConfig
    EndpointConfig -->|"reads import.meta.env.VITE_*\nwith hardcoded fallbacks"| EndpointConfig
    ServiceModule -->|"apiClient.get/post/put/patch/delete"| AxiosClient
    AxiosClient -->|"Authorization: Bearer {token}\nbaseURL: VITE_API_BASE_URL"| MockServer
```

### Axios Client Behaviour

- **Base URL:** `VITE_API_BASE_URL` (defaults to `/api`)
- **Timeout:** `VITE_REQUEST_TIMEOUT_MS` (defaults to 5000 ms)
- **Request interceptor:** Reads `skillsmine.auth.tokens` from sessionStorage and injects `Authorization: Bearer` header when present
- **Response interceptor:** On HTTP 401, calls `tokenStorage.clearAuth()` — no redirect (redirect is handled by route guard on next navigation)

File: [`src/services/api/axios.ts`](src/services/api/axios.ts)

### Service Modules

| Module | Endpoints covered |
|---|---|
| `authApi.ts` | register, login, googleExchange, forgotPassword, changePassword, logout |
| `candidateApi.ts` | users profile (get/update/photo), candidate dashboard, buildMyCv, resume preview/download, recommended jobs, application CV upload, application stage transition |
| `jobsApi.ts` | list jobs (paginated), getById, save, apply, create |
| `mandateApi.ts` | recruiter dashboard, mandate CRUD, application stage update, candidate search, ATS profile, pipeline advance, MANCO dashboard, recruiter performance |
| `crmApi.ts` | list clients, add note |

---

## 6. Endpoint Configuration System

All API endpoint strings are resolved at startup from environment variables. Hardcoded string fallbacks are provided so the app works with no extra env configuration (e.g., in CI).

```mermaid
graph LR
    ENV[".env / VITE_* keys"]
    Endpoints["src/services/api/endpoints.ts\napiEndpoints object"]
    Resolve["resolveEndpoint(template, params)\nReplaces :param tokens"]
    Services["Service modules"]

    ENV -->|"import.meta.env lookup\nwith withDefault fallback"| Endpoints
    Endpoints --> Services
    Services -->|"dynamic path params"| Resolve
    Resolve --> Services
```

### `resolveEndpoint` usage

```ts
// Template from env: '/users/:userId'
resolveEndpoint(apiEndpoints.users.profile, { userId: '123' })
// → '/users/123'

// Template from env: '/v1/pipeline/:pipelineId/stage'
resolveEndpoint(apiEndpoints.pipeline.stageUpdate, { pipelineId: 'p-42' })
// → '/v1/pipeline/p-42/stage'
```

Path params are `encodeURIComponent`-encoded. Templates with no dynamic segments are passed through unchanged.

File: [`src/services/api/endpoints.ts`](src/services/api/endpoints.ts)

### `apiEndpoints` Structure

```
apiEndpoints
├── auth        register / login / forgotPassword / changePassword / logout / googleExchange
├── users       profile / profilePhoto
├── candidate   dashboard / buildMyCv / resumePreview / resumeDownload / recommendedJobs
├── applications cvUpload / stageTransition / recruiterStageUpdate
├── jobs        list / details / save / apply / listQueryParam / listPageParam / listLimitParam
├── recruiter   dashboard / mandates / candidatesSearch / mandateDetail / candidateProfile
├── pipeline    stageUpdate
├── manco       dashboard / recruiterPerformance
└── crm         clients / clientNotes / statusParam
```

---

## 7. State Management

```mermaid
graph LR
    subgraph "Redux Store"
        auth["auth slice\nauthSlice.ts"]
        permission["permission slice\npermissionSlice.ts"]
        recruiterPipeline["recruiterPipeline slice\nrecruiterPipelineSlice.ts"]
        ui["ui slice\nuiSlice.ts"]
        notification["notification slice\nnotificationSlice.ts"]
        api["RTK Query cache\napiSlice.ts"]
    end

    AuthContext["AuthContext\n(session state)"]
    Pages["Pages / Components"]

    Pages -->|"useSelector / useDispatch"| auth
    Pages -->|"useSelector / useDispatch"| recruiterPipeline
    Pages -->|"useSelector / useDispatch"| ui
    Pages -->|"useDispatch (pushNotification)"| notification
    Pages -->|"useGetCandidateProfileQuery\nuseGetCandidateDashboardQuery\nuseLazyListJobsPageQuery"| api
    AuthContext -->|"login() → setSession"| AuthContext
    AuthContext -.->|"logout() → resetApiState"| api
```

### Slice Summary

| Slice | Purpose | Key actions |
|---|---|---|
| `auth` | Legacy auth flags | — |
| `permission` | Permission token set | — |
| `recruiterPipeline` | Recruiter mock pipeline state (mandates, candidates, stage counts) | `selectMandate`, `moveCandidateToStage`, `addRecruiterNote`, `addDocument` |
| `ui` | Landing mode toggle (candidate vs recruiter) | `setLandingMode` |
| `notification` | Toast notification queue | `pushNotification`, `dismissNotification` |
| `api` (RTK Query) | Server cache for profile, dashboard, jobs | auto-generated hooks |

### RTK Query Endpoints

| Endpoint | Tag | Usage |
|---|---|---|
| `getCandidateProfile(userId)` | `CandidateProfile:{userId}` | ProfilePage, CvBuilderPage |
| `getCandidateDashboard()` | `CandidateDashboard:SELF` | CandidateDashboardPage |
| `updateCandidateProfile({userId, payload})` | Invalidates profile + dashboard | ProfilePage save |
| `listJobsPage({searchQuery, page, pageSize})` | `Jobs:{query}:{page}:{pageSize}` | LandingPage, JobsPage |

---

## 8. Module Structure

```
src/
├── app/                    Application-level providers, auth context, validation schemas
│   ├── auth/               AuthContext, jwt utilities, tokenStorage
│   └── validation.schema.ts  Shared Zod schemas (email, signup)
├── assets/                 Static images/icons per feature domain
├── components/             Shared UI primitives (PasswordVisibilityAdornment, NotificationToaster, placeholders)
├── hooks/                  Shared React hooks (useDebouncedValue, useSearchQueryState, useZodForm)
├── layouts/                Layout shells per role (PublicLayout, CandidateLayout, RecruiterLayout, etc.)
├── modules/                Feature modules (one directory per domain)
│   ├── auth/               Login, Signup pages + form types
│   ├── candidate/          Dashboard, Profile, Jobs pages + hooks + services + types
│   ├── crm/                CRM page (clients list + note creation)
│   ├── cv-builder/         Multi-step CV builder, preview, review + hooks
│   ├── dashboard/          Admin dashboard entry placeholder
│   ├── exco/               Exco placeholder
│   ├── manco/              MANCO placeholder
│   ├── mandates/           Mandate-related types
│   ├── pipeline/           Pipeline types
│   ├── public/             Landing page, sign-up drawers, public jobs search hooks
│   ├── recruiter/          Recruiter dashboard, mandate detail, new mandate, candidate profile
│   ├── reports/            Reports placeholder
│   └── skills-builder/     Skills builder placeholder
├── routes/                 Route definitions, guards (ProtectedRoute, RoleGuard, PermissionGuard), PortalRoute
├── services/               API transport layer
│   └── api/                axios client, endpoint config, all service modules
├── store/                  Redux store, slices, RTK Query slice, thunks, selectors
├── test/                   Vitest setup
├── theme/                  MUI theme tokens (colors, spacing, typography)
├── types/                  Shared TypeScript types (api.ts, auth.ts, common.ts, jobs.ts)
├── vite-env.d.ts           ImportMetaEnv declarations for all VITE_* keys
└── workflow/               Workflow config and service (pipeline stage definitions)
```

---

## 9. Data Flow: Candidate Profile

```mermaid
sequenceDiagram
    participant ProfilePage
    participant useCandidateProfileQuery
    participant apiSlice (RTK Query)
    participant candidateApi
    participant endpoints.ts
    participant Axios
    participant MockServer

    ProfilePage->>useCandidateProfileQuery: useCandidateProfileQuery(userId)
    useCandidateProfileQuery->>apiSlice (RTK Query): getCandidateProfile(userId)
    apiSlice (RTK Query)->>candidateApi: candidateApi.getById(userId)
    candidateApi->>endpoints.ts: resolveEndpoint(users.profile, {userId})
    endpoints.ts-->>candidateApi: "/users/USR100001"
    candidateApi->>Axios: GET /users/USR100001
    Axios->>MockServer: GET http://localhost:4000/api/users/USR100001
    MockServer-->>Axios: CandidateProfileResponse
    Axios-->>candidateApi: response.data
    candidateApi->>candidateApi: mapProfileResponse(payload)
    Note over candidateApi: Maps nested personalDetails,\ndesiredJob, education, experience,\nskills, languages
    candidateApi-->>apiSlice (RTK Query): CandidateProfile
    apiSlice (RTK Query)-->>ProfilePage: { data: CandidateProfile, isLoading, isError }
    ProfilePage->>ProfilePage: reset form with getProfileFormValues(profile)
```

**Save flow** follows the reverse path: form values → `getCandidateProfileUpdatePayload` → `saveProfileThunk` → `updateCandidateProfile` mutation → `PUT /users/:userId` → invalidates profile + dashboard cache.

---

## 10. Data Flow: Login & Session Establishment

```mermaid
flowchart TD
    A([User submits login form]) --> B[authApi.login]
    B --> C[POST /auth/login]
    C --> D{Response OK?}
    D -- No --> E[Show error alert]
    D -- Yes --> F[mapLoginResponseToSession]
    F --> G["decodeJwtPayload(accessToken)\nExtract: userId, email, firstName,\nlastName, recruiterId"]
    G --> H[normalizePermissions from roles]
    H --> I[AuthContext.login payload]
    I --> J[tokenStorage.setTokens + setUser\n→ sessionStorage]
    I --> K[setSession → isAuthenticated = true]
    K --> L[navigate /portal]
    L --> M[PortalRoute reads user.role]
    M --> N{Role?}
    N -- JOB_SEEKER --> O[/candidate/dashboard]
    N -- RECRUITER --> P[/recruiter]
    N -- MANCO --> Q[/manco]
    N -- ADMIN --> R[/dashboard]
```

---

## 11. Environment Variable Catalog

All variables are declared in [`src/vite-env.d.ts`](src/vite-env.d.ts) and resolved via [`src/services/api/endpoints.ts`](src/services/api/endpoints.ts).

| Variable | Description | Default fallback |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID | (optional — OAuth disabled if absent) |
| `VITE_API_BASE_URL` | Backend API base URL | `/api` |
| `VITE_REQUEST_TIMEOUT_MS` | Axios timeout in ms | `5000` |
| `VITE_MOCK_ERROR_RATE` | Mock server error injection rate | `0.02` |
| `VITE_MOCK_DELAY_MIN_MS` | Mock server min response delay | `300` |
| `VITE_MOCK_DELAY_MAX_MS` | Mock server max response delay | `900` |
| `VITE_AUTH_REGISTER_ENDPOINT` | POST register | `/auth/register` |
| `VITE_AUTH_LOGIN_ENDPOINT` | POST login | `/auth/login` |
| `VITE_AUTH_FORGOT_PASSWORD_ENDPOINT` | POST forgot password | `/auth/forgot-password` |
| `VITE_AUTH_CHANGE_PASSWORD_ENDPOINT` | POST change password | `/auth/change-password` |
| `VITE_AUTH_LOGOUT_ENDPOINT` | POST logout | `/auth/logout` |
| `VITE_AUTH_GOOGLE_EXCHANGE_ENDPOINT` | POST Google token exchange | `/auth/google/exchange` |
| `VITE_AUTH_ME_ENDPOINT` | GET current user | `/auth/me` |
| `VITE_USERS_PROFILE_ENDPOINT` | GET/PUT user profile | `/users/:userId` |
| `VITE_USERS_PROFILE_PHOTO_ENDPOINT` | POST/DELETE profile photo | `/users/:userId/profile-photo` |
| `VITE_CANDIDATE_DASHBOARD_ENDPOINT` | GET candidate dashboard | `/candidate/dashboard` |
| `VITE_CANDIDATE_BUILDMYCV_ENDPOINT` | POST build my CV | `/candidate/buildmycv` |
| `VITE_CANDIDATE_RESUME_PREVIEW_ENDPOINT` | GET resume preview | `/candidate/:resumeId/preview` |
| `VITE_CANDIDATE_RESUME_DOWNLOAD_ENDPOINT` | GET resume download | `/candidate/:resumeId/download` |
| `VITE_CANDIDATE_RECOMMENDED_JOBS_ENDPOINT` | GET recommended jobs | `/candidate/:candidateId/recommended-jobs` |
| `VITE_APPLICATION_CV_UPLOAD_ENDPOINT` | POST CV upload | `/applications/:applicationId/cv/upload` |
| `VITE_JOBS_ENDPOINT` | GET/POST jobs | `/jobs` |
| `VITE_JOB_DETAILS_ENDPOINT` | GET job by ID | `/jobs/:jobId` |
| `VITE_JOB_SAVE_ENDPOINT` | POST save job | `/jobs/:jobId/save` |
| `VITE_JOB_APPLY_ENDPOINT` | POST apply to job | `/jobs/:jobId/apply` |
| `VITE_OPPORTUNITIES_ENDPOINT` | GET public opportunities | `/opportunities` |
| `VITE_JOBS_QUERY_PARAM` | Search query param name | `q` |
| `VITE_JOBS_PAGE_PARAM` | Page param name | `page` |
| `VITE_JOBS_LIMIT_PARAM` | Limit param name | `limit` |
| `VITE_SKILLS_SEARCH_ENDPOINT` | GET skills search | `/skills/search` |
| `VITE_RECRUITER_DASHBOARD_ENDPOINT` | GET recruiter dashboard | `/recruiter/dashboard` |
| `VITE_RECRUITER_MANDATES_ENDPOINT` | GET/POST mandates | `/recruiter/mandates` |
| `VITE_RECRUITER_APPLICATION_STAGE_ENDPOINT` | PUT application stage | `/recruiter/applications/:applicationId/stage` |
| `VITE_RECRUITER_CANDIDATES_SEARCH_ENDPOINT` | GET candidates search | `/recruiter/candidates/search` |
| `VITE_MANDATE_DETAIL_ENDPOINT` | GET mandate detail | `/mandates/:mandateId` |
| `VITE_APPLICATION_STAGE_TRANSITION_ENDPOINT` | GET stage transition | `/applications/:applicationId/stage-transition` |
| `VITE_RECRUITER_CANDIDATE_PROFILE_ENDPOINT` | GET ATS candidate profile | `/v1/candidates/:candidateId/profile` |
| `VITE_PIPELINE_STAGE_UPDATE_ENDPOINT` | PATCH pipeline stage | `/v1/pipeline/:pipelineId/stage` |
| `VITE_MANCO_DASHBOARD_ENDPOINT` | GET MANCO dashboard | `/v1/manco/:mancoId/dashboard` |
| `VITE_MANCO_RECRUITER_PERFORMANCE_ENDPOINT` | GET recruiter performance | `/v1/manco/recruiters/:id/performance` |
| `VITE_CRM_CLIENTS_ENDPOINT` | GET CRM clients | `/v1/crm/clients` |
| `VITE_CRM_CLIENT_NOTES_ENDPOINT` | POST CRM client note | `/v1/crm/clients/:clientId/notes` |
| `VITE_CRM_STATUS_PARAM` | CRM status query param name | `status` |

---

## 12. Error Handling Strategy

```mermaid
flowchart TD
    A[API call fails] --> B{Source?}
    B -- "Axios response error" --> C{Status code?}
    C -- 401 --> D[tokenStorage.clearAuth\nNext navigation → login redirect]
    C -- Other --> E[Error propagates as rejected Promise]
    B -- "Network error" --> E
    E --> F{Consumer type?}
    F -- RTK Query endpoint --> G["withMappedApiError wrapper\n→ ApiError shape\n→ RTK Query error state"]
    F -- Direct service call --> H["try/catch in page/hook\n→ pushNotification (error toast)\nor local error state"]
    G --> I[isError flag in hook\n→ Alert component in page]
    H --> J[NotificationToaster renders toast]
```

**`withMappedApiError`** (`src/store/api/queryHelpers.ts`) wraps async service calls and translates Axios errors into the `ApiError` shape RTK Query understands.

**Profile and dashboard pages** show inline `<Alert severity="error">` on load failure and disable save actions until data is ready.

---

## 13. Key Design Decisions

### RTK Query + Axios coexistence

RTK Query is used for the three most frequently cached entities (candidate profile, candidate dashboard, jobs list). Direct Axios service calls are used everywhere else. This avoids over-caching entities like mandate submission or CRM notes while still getting automatic cache invalidation on profile saves.

### Session-only token storage

Auth tokens are stored in `sessionStorage` (not `localStorage`) so they are cleared automatically when the tab is closed. This avoids stale session issues between devices and reduces the risk of XSS credential theft across sessions.

### Env-driven endpoint config with hardcoded fallbacks

Every endpoint URL is resolved from `VITE_*` env keys via `apiEndpoints` in `endpoints.ts`. Hardcoded fallbacks mirror the mock server contract, so the app works out of the box without a `.env` file and also makes endpoint drift immediately visible when keys diverge.

### Permission derivation at login, not per-request

Permissions are expanded from roles once at login time and stored on the `AuthUser` object. Guards (`PermissionGuard`, `RoleGuard`) read from React context synchronously, avoiding async permission checks on every render.

### Stage mapping telemetry

The candidate dashboard stage-to-status and stage-to-pipeline mapping uses explicit lookup tables with a `console.warn` on unknown stage values (logged once per unknown stage via a `Set`). This surfaces new backend stage values in development without crashing the UI.
