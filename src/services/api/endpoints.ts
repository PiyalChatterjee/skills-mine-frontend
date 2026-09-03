type PathParams = Record<string, string | number>;

const withDefault = (value: string | undefined, fallback: string): string =>
  (value && value.trim()) || fallback;

export const apiEndpoints = {
  auth: {
    candidateRegister: withDefault(
      import.meta.env.VITE_AUTH_CANDIDATE_REGISTER_ENDPOINT,
      "/api/auth-service/v1/auth/candidates/register",
    ),
    staffRegister: withDefault(
      import.meta.env.VITE_AUTH_STAFF_REGISTER_ENDPOINT,
      "/api/auth-service/v1/auth/staff/register",
    ),
    candidateVisitorConversion: withDefault(
      import.meta.env.VITE_AUTH_CANDIDATE_VISITOR_CONVERSION_ENDPOINT,
      "/api/auth-service/v1/auth/candidates/register/visitor/conversion",
    ),
    googleRegister: withDefault(
      import.meta.env.VITE_AUTH_GOOGLE_REGISTER_ENDPOINT,
      "/api/auth-service/v1/auth/candidates/register-google",
    ),
    login: withDefault(import.meta.env.VITE_AUTH_LOGIN_ENDPOINT, "/api/auth-service/v1/auth/login"),
    forgotPassword: withDefault(
      import.meta.env.VITE_AUTH_FORGOT_PASSWORD_ENDPOINT,
      "/api/auth-service/v1/auth/forgot-password",
    ),
    resetPassword: withDefault(
      import.meta.env.VITE_AUTH_RESET_PASSWORD_ENDPOINT,
      "/api/auth-service/v1/auth/reset-password",
    ),
    logout: withDefault(
      import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT,
      "/api/auth-service/v1/auth/logout",
    ),
    me: withDefault(
      import.meta.env.VITE_AUTH_ME_ENDPOINT,
      "/api/auth-service/v1/users/me",
    ),
    validate: withDefault(import.meta.env.VITE_AUTH_VALIDATE_ENDPOINT, "/api/auth-service/v1/users/validate"),
  },
  staff: {
    profiles: withDefault(import.meta.env.VITE_STAFF_PROFILES_ENDPOINT, "/api/auth-service/v1/staff/profiles"),
  },
  admin: {
    staffInvitationsSend: withDefault(import.meta.env.VITE_ADMIN_STAFF_INVITATIONS_SEND_ENDPOINT, "/api/auth-service/v1/admin/staff-invitations/send"),
  },
  documents: {
    upload: withDefault(
      import.meta.env.VITE_DOCUMENTS_UPLOAD_ENDPOINT,
      "/documents",
    ),
    uploadResume: withDefault(
      import.meta.env.VITE_DOCUMENTS_UPLOAD_RESUME_ENDPOINT,
      "/documents/resume",
    ),
  },
  users: {
    profile: withDefault(
      import.meta.env.VITE_USERS_PROFILE_ENDPOINT,
      "/users/:userId",
    ),
    profilePhoto: withDefault(
      import.meta.env.VITE_USERS_PROFILE_PHOTO_ENDPOINT,
      "/users/:userId/profile-photo",
    ),
  },
  // Candidate resources are resolved from the bearer token by the backend, so the
  // default templates carry no :candidateId segment. Deployments that expose the
  // candidate-scoped variant can opt in through the matching VITE_* override
  // (e.g. VITE_CANDIDATE_PROFILE_ENDPOINT=/candidates/profile/:candidateId) —
  // resolveEndpoint only substitutes placeholders that the template declares.
  candidate: {
    landing: withDefault(
      import.meta.env.VITE_CANDIDATE_LANDING_ENDPOINT,
      "/candidates/landing",
    ),
    statistics: withDefault(
      import.meta.env.VITE_CANDIDATE_STATISTICS_ENDPOINT,
      "/candidates/landing",
    ),
    dashboard: withDefault(
      import.meta.env.VITE_CANDIDATE_DASHBOARD_ENDPOINT,
      "/candidates/dashboard",
    ),
    buildMyCv: withDefault(
      import.meta.env.VITE_CANDIDATE_BUILDMYCV_ENDPOINT,
      "/candidates/cv-build/",
    ),
    profile: withDefault(
      import.meta.env.VITE_CANDIDATE_PROFILE_ENDPOINT,
      "/candidates/profile/",
    ),
    resumePreview: withDefault(
      import.meta.env.VITE_CANDIDATE_RESUME_PREVIEW_ENDPOINT,
      "/candidate/:resumeId/preview",
    ),
    resumeDownload: withDefault(
      import.meta.env.VITE_CANDIDATE_RESUME_DOWNLOAD_ENDPOINT,
      "/candidate/:resumeId/download",
    ),
    recommendedJobs: withDefault(
      import.meta.env.VITE_CANDIDATE_RECOMMENDED_JOBS_ENDPOINT,
      "/candidates/recommended-positions",
    ),
    savedJobs: withDefault(
      import.meta.env.VITE_CANDIDATE_SAVED_JOBS_ENDPOINT,
      "/candidates/saved-jobs",
    ),
    savedJob: withDefault(
      import.meta.env.VITE_CANDIDATE_SAVED_JOB_ENDPOINT,
      "/candidates/saved-jobs/:jobProfileId",
    ),
    aiActions: withDefault(
      import.meta.env.VITE_CANDIDATE_AI_ACTIONS_ENDPOINT,
      "/candidates/ai-actions/",
    ),
    applications: withDefault(
      import.meta.env.VITE_CANDIDATE_APPLICATIONS_ENDPOINT,
      "/candidates/applications",
    ),
  },
  applications: {
    cvUpload: withDefault(
      import.meta.env.VITE_APPLICATION_CV_UPLOAD_ENDPOINT,
      "/applications/:applicationId/cv/upload",
    ),
    stageTransition: withDefault(
      import.meta.env.VITE_APPLICATION_STAGE_TRANSITION_ENDPOINT,
      "/applications/:applicationId/stage-transition",
    ),
    recruiterStageUpdate: withDefault(
      import.meta.env.VITE_RECRUITER_APPLICATION_STAGE_ENDPOINT,
      "/recruiter/applications/:applicationId/stage",
    ),
  },
  jobs: {
    list: withDefault(import.meta.env.VITE_JOBS_ENDPOINT, "/jobs"),
    details: withDefault(
      import.meta.env.VITE_JOB_DETAILS_ENDPOINT,
      "/jobs/:jobProfileId",
    ),
    profileDetails: withDefault(
      import.meta.env.VITE_JOB_PROFILE_DETAILS_ENDPOINT,
      "/jobs/:jobProfileId",
    ),
    listQueryParam: withDefault(import.meta.env.VITE_JOBS_QUERY_PARAM, "search"),
    listPageParam: withDefault(import.meta.env.VITE_JOBS_PAGE_PARAM, "page"),
    listLimitParam: withDefault(import.meta.env.VITE_JOBS_LIMIT_PARAM, "size"),
  },
  dashboard: {
    summary: withDefault(
      import.meta.env.VITE_DASHBOARD_SUMMARY_ENDPOINT,
      "/dashboard/summary",
    ),
  },
  companies: {
    list: withDefault(
      import.meta.env.VITE_COMPANIES_LIST_ENDPOINT,
      "/companies",
    ),
  },
  industries: {
    list: withDefault(
      import.meta.env.VITE_INDUSTRIES_LIST_ENDPOINT,
      "/industries",
    ),
  },
  locations: {
    list: withDefault(
      import.meta.env.VITE_LOCATIONS_LIST_ENDPOINT,
      "/locations",
    ),
  },
  skills: {
    search: withDefault(
      import.meta.env.VITE_SKILLS_SEARCH_ENDPOINT,
      "/skills/search",
    ),
    generate: withDefault(
      import.meta.env.VITE_SKILLS_GENERATE_ENDPOINT,
      "/skills/generate",
    ),
    keywordParam: withDefault(
      import.meta.env.VITE_SKILLS_SEARCH_KEYWORD_PARAM,
      "keyword",
    ),
    limitParam: withDefault(
      import.meta.env.VITE_SKILLS_SEARCH_LIMIT_PARAM,
      "limit",
    ),
  },
  candidates: {
    list: withDefault(
      import.meta.env.VITE_CANDIDATES_LIST_ENDPOINT,
      "/candidates",
    ),
  },
  recruiter: {
    dashboard: withDefault(
      import.meta.env.VITE_RECRUITER_DASHBOARD_ENDPOINT,
      "/recruiter/dashboard",
    ),
    mandates: withDefault(
      import.meta.env.VITE_RECRUITER_MANDATES_ENDPOINT,
      "/recruiter/mandates",
    ),
    candidatesSearch: withDefault(
      import.meta.env.VITE_RECRUITER_CANDIDATES_SEARCH_ENDPOINT,
      "/recruiter/candidates/search",
    ),
    mandateDetail: withDefault(
      import.meta.env.VITE_MANDATE_DETAIL_ENDPOINT,
      "/mandates/:mandateId",
    ),
    candidateProfile: withDefault(
      import.meta.env.VITE_RECRUITER_CANDIDATE_PROFILE_ENDPOINT,
      "/v1/candidates/:candidateId/profile",
    ),
    tourStatus: withDefault(
      import.meta.env.VITE_RECRUITER_TOUR_STATUS_ENDPOINT,
      "/api/v1/recruiters/me/tour-status",
    ),
  },
  pipeline: {
    stageUpdate: withDefault(
      import.meta.env.VITE_PIPELINE_STAGE_UPDATE_ENDPOINT,
      "/v1/pipeline/:pipelineId/stage",
    ),
  },
  manco: {
    dashboard: withDefault(
      import.meta.env.VITE_MANCO_DASHBOARD_ENDPOINT,
      "/v1/manco/:mancoId/dashboard",
    ),
    recruiterPerformance: withDefault(
      import.meta.env.VITE_MANCO_RECRUITER_PERFORMANCE_ENDPOINT,
      "/v1/manco/recruiters/:id/performance",
    ),
  },
  jobPosts: {
    list: withDefault(
      import.meta.env.VITE_JOB_POSTS_ENDPOINT,
      "/job-posts",
    ),
    create: withDefault(
      import.meta.env.VITE_JOB_POST_CREATE_ENDPOINT,
      "/job-posts",
    ),
    detail: withDefault(
      import.meta.env.VITE_JOB_POST_DETAIL_ENDPOINT,
      "/job-posts/:mandateId",
    ),
    update: withDefault(
      import.meta.env.VITE_JOB_POST_UPDATE_ENDPOINT,
      "/job-posts/:mandateId",
    ),
    delete: withDefault(
      import.meta.env.VITE_JOB_POST_DELETE_ENDPOINT,
      "/job-posts/:mandateId",
    ),
  },
  crm: {
    clients: withDefault(
      import.meta.env.VITE_CRM_CLIENTS_ENDPOINT,
      "/v1/crm/clients",
    ),
    clientNotes: withDefault(
      import.meta.env.VITE_CRM_CLIENT_NOTES_ENDPOINT,
      "/v1/crm/clients/:clientId/notes",
    ),
    statusParam: withDefault(import.meta.env.VITE_CRM_STATUS_PARAM, "status"),
  },
} as const;

export const resolveEndpoint = (
  template: string,
  params?: PathParams,
): string => {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((resolved, [key, value]) => {
    return resolved.replace(`:${key}`, encodeURIComponent(String(value)));
  }, template);
};
