type PathParams = Record<string, string | number>

const withDefault = (value: string | undefined, fallback: string): string =>
  (value && value.trim()) || fallback

export const apiEndpoints = {
  auth: {
    register: withDefault(import.meta.env.VITE_AUTH_REGISTER_ENDPOINT, '/auth/register'),
    login: withDefault(import.meta.env.VITE_AUTH_LOGIN_ENDPOINT, '/auth/login'),
    forgotPassword: withDefault(import.meta.env.VITE_AUTH_FORGOT_PASSWORD_ENDPOINT, '/auth/forgot-password'),
    changePassword: withDefault(import.meta.env.VITE_AUTH_CHANGE_PASSWORD_ENDPOINT, '/auth/change-password'),
    logout: withDefault(import.meta.env.VITE_AUTH_LOGOUT_ENDPOINT, '/auth/logout'),
    googleExchange: withDefault(import.meta.env.VITE_AUTH_GOOGLE_EXCHANGE_ENDPOINT, '/auth/google/exchange'),
  },
  users: {
    profile: withDefault(import.meta.env.VITE_USERS_PROFILE_ENDPOINT, '/users/:userId'),
    profilePhoto: withDefault(import.meta.env.VITE_USERS_PROFILE_PHOTO_ENDPOINT, '/users/:userId/profile-photo'),
  },
  candidate: {
    dashboard: withDefault(import.meta.env.VITE_CANDIDATE_DASHBOARD_ENDPOINT, '/candidate/dashboard'),
    buildMyCv: withDefault(import.meta.env.VITE_CANDIDATE_BUILDMYCV_ENDPOINT, '/candidate/buildmycv'),
    resumePreview: withDefault(import.meta.env.VITE_CANDIDATE_RESUME_PREVIEW_ENDPOINT, '/candidate/:resumeId/preview'),
    resumeDownload: withDefault(import.meta.env.VITE_CANDIDATE_RESUME_DOWNLOAD_ENDPOINT, '/candidate/:resumeId/download'),
    recommendedJobs: withDefault(import.meta.env.VITE_CANDIDATE_RECOMMENDED_JOBS_ENDPOINT, '/candidate/:candidateId/recommended-jobs'),
  },
  applications: {
    cvUpload: withDefault(import.meta.env.VITE_APPLICATION_CV_UPLOAD_ENDPOINT, '/applications/:applicationId/cv/upload'),
    stageTransition: withDefault(import.meta.env.VITE_APPLICATION_STAGE_TRANSITION_ENDPOINT, '/applications/:applicationId/stage-transition'),
    recruiterStageUpdate: withDefault(import.meta.env.VITE_RECRUITER_APPLICATION_STAGE_ENDPOINT, '/recruiter/applications/:applicationId/stage'),
  },
  jobs: {
    list: withDefault(import.meta.env.VITE_JOBS_ENDPOINT, '/jobs'),
    details: withDefault(import.meta.env.VITE_JOB_DETAILS_ENDPOINT, '/jobs/:jobId'),
    save: withDefault(import.meta.env.VITE_JOB_SAVE_ENDPOINT, '/jobs/:jobId/save'),
    apply: withDefault(import.meta.env.VITE_JOB_APPLY_ENDPOINT, '/jobs/:jobId/apply'),
    listQueryParam: withDefault(import.meta.env.VITE_JOBS_QUERY_PARAM, 'q'),
    listPageParam: withDefault(import.meta.env.VITE_JOBS_PAGE_PARAM, 'page'),
    listLimitParam: withDefault(import.meta.env.VITE_JOBS_LIMIT_PARAM, 'limit'),
  },
  recruiter: {
    dashboard: withDefault(import.meta.env.VITE_RECRUITER_DASHBOARD_ENDPOINT, '/recruiter/dashboard'),
    mandates: withDefault(import.meta.env.VITE_RECRUITER_MANDATES_ENDPOINT, '/recruiter/mandates'),
    candidatesSearch: withDefault(import.meta.env.VITE_RECRUITER_CANDIDATES_SEARCH_ENDPOINT, '/recruiter/candidates/search'),
    mandateDetail: withDefault(import.meta.env.VITE_MANDATE_DETAIL_ENDPOINT, '/mandates/:mandateId'),
    candidateProfile: withDefault(import.meta.env.VITE_RECRUITER_CANDIDATE_PROFILE_ENDPOINT, '/v1/candidates/:candidateId/profile'),
  },
  pipeline: {
    stageUpdate: withDefault(import.meta.env.VITE_PIPELINE_STAGE_UPDATE_ENDPOINT, '/v1/pipeline/:pipelineId/stage'),
  },
  manco: {
    dashboard: withDefault(import.meta.env.VITE_MANCO_DASHBOARD_ENDPOINT, '/v1/manco/:mancoId/dashboard'),
    recruiterPerformance: withDefault(import.meta.env.VITE_MANCO_RECRUITER_PERFORMANCE_ENDPOINT, '/v1/manco/recruiters/:id/performance'),
  },
  crm: {
    clients: withDefault(import.meta.env.VITE_CRM_CLIENTS_ENDPOINT, '/v1/crm/clients'),
    clientNotes: withDefault(import.meta.env.VITE_CRM_CLIENT_NOTES_ENDPOINT, '/v1/crm/clients/:clientId/notes'),
    statusParam: withDefault(import.meta.env.VITE_CRM_STATUS_PARAM, 'status'),
  },
} as const

export const resolveEndpoint = (template: string, params?: PathParams): string => {
  if (!params) {
    return template
  }

  return Object.entries(params).reduce((resolved, [key, value]) => {
    return resolved.replace(`:${key}`, encodeURIComponent(String(value)))
  }, template)
}
