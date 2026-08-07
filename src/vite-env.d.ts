/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_REQUEST_TIMEOUT_MS: string
  readonly VITE_MOCK_ERROR_RATE: string
  readonly VITE_MOCK_DELAY_MIN_MS: string
  readonly VITE_MOCK_DELAY_MAX_MS: string

  readonly VITE_AUTH_REGISTER_ENDPOINT: string
  readonly VITE_AUTH_LOGIN_ENDPOINT: string
  readonly VITE_AUTH_FORGOT_PASSWORD_ENDPOINT: string
  readonly VITE_AUTH_CHANGE_PASSWORD_ENDPOINT: string
  readonly VITE_AUTH_LOGOUT_ENDPOINT: string
  readonly VITE_AUTH_GOOGLE_EXCHANGE_ENDPOINT: string
  readonly VITE_AUTH_ME_ENDPOINT: string

  readonly VITE_USERS_PROFILE_ENDPOINT: string
  readonly VITE_USERS_PROFILE_PHOTO_ENDPOINT: string

  readonly VITE_CANDIDATE_DASHBOARD_ENDPOINT: string
  readonly VITE_CANDIDATE_BUILDMYCV_ENDPOINT: string
  readonly VITE_CANDIDATE_RESUME_PREVIEW_ENDPOINT: string
  readonly VITE_CANDIDATE_RESUME_DOWNLOAD_ENDPOINT: string
  readonly VITE_CANDIDATE_RECOMMENDED_JOBS_ENDPOINT: string
  readonly VITE_APPLICATION_CV_UPLOAD_ENDPOINT: string

  readonly VITE_JOBS_ENDPOINT: string
  readonly VITE_JOB_DETAILS_ENDPOINT: string
  readonly VITE_JOB_SAVE_ENDPOINT: string
  readonly VITE_JOB_APPLY_ENDPOINT: string
  readonly VITE_OPPORTUNITIES_ENDPOINT: string
  readonly VITE_JOBS_QUERY_PARAM: string
  readonly VITE_JOBS_PAGE_PARAM: string
  readonly VITE_JOBS_PAGE_SIZE_PARAM: string
  readonly VITE_JOBS_LIMIT_PARAM: string

  readonly VITE_SKILLS_SEARCH_ENDPOINT: string
  readonly VITE_SKILLS_SEARCH_KEYWORD_PARAM: string
  readonly VITE_SKILLS_SEARCH_LIMIT_PARAM: string

  readonly VITE_RECRUITER_DASHBOARD_ENDPOINT: string
  readonly VITE_RECRUITER_MANDATES_ENDPOINT: string
  readonly VITE_RECRUITER_APPLICATION_STAGE_ENDPOINT: string
  readonly VITE_RECRUITER_CANDIDATES_SEARCH_ENDPOINT: string
  readonly VITE_MANDATE_DETAIL_ENDPOINT: string
  readonly VITE_APPLICATION_STAGE_TRANSITION_ENDPOINT: string
  readonly VITE_RECRUITER_CANDIDATE_PROFILE_ENDPOINT: string

  readonly VITE_PIPELINE_STAGE_UPDATE_ENDPOINT: string

  readonly VITE_MANCO_DASHBOARD_ENDPOINT: string
  readonly VITE_MANCO_RECRUITER_PERFORMANCE_ENDPOINT: string

  readonly VITE_CRM_CLIENTS_ENDPOINT: string
  readonly VITE_CRM_CLIENT_NOTES_ENDPOINT: string
  readonly VITE_CRM_STATUS_PARAM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}