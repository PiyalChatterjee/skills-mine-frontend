type PathParams = Record<string, string | number>;

// ---------------------------------------------------------------------------
// All API path constants live here. Base URLs (per microservice) are managed
// in axios.ts via VITE_*_API_BASE_URL environment variables.
// To change a path for a specific environment, update it here — not in .env.
// ---------------------------------------------------------------------------

export const apiEndpoints = {
  auth: {
    candidateRegister: "/auth/candidates/register",
    candidateVisitorConversion: "/auth/candidates/register/visitor/conversion",
    staffRegister: "/auth/staff/register",
    googleRegister: "/auth/candidates/register-google",
    login: "/auth/login",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    logout: "/auth/logout",
    me: "/users/me",
    validate: "/users/validate",
  },
  staff: {
    profiles: "/staff/profiles",
  },
  admin: {
    staffInvitationsSend: "/admin/staff-invitations/send",
  },
  users: {
    profile: "/users/:userId",
    profilePhoto: "/users/:userId/profile-photo",
  },
  documents: {
    owner: "/documents/owner/:ownerType/:ownerId",
    detail: "/documents/:documentId",
    download: "/documents/:documentId/download",
    upload: "/documents",
    uploadResume: "/documents/resume",
  },
  candidate: {
    landing: "/candidates/landing",
    statistics: "/candidates/landing",
    dashboard: "/candidates/dashboard",
    profile: "/candidates/profile/:candidateId",
    buildMyCv: "/candidates/cv-build/:candidateId",
    resumePreview: "/candidate/:resumeId/preview",
    resumeDownload: "/candidate/:resumeId/download",
    recommendedJobs: "/candidates/:candidateId/recommended-positions",
    savedJobs: "/candidates/:candidateId/saved-jobs",
    savedJob: "/candidates/:candidateId/saved-jobs/:jobProfileId",
    aiActions: "/candidates/ai-actions/",
    applications: "/candidates/apply",
    byEmail: "/candidates/by-email",
  },
  candidates: {
    list: "/candidates",
    dashboard: "/candidates/dashboard/:candidateId",
  },
  applications: {
    cvUpload: "/applications/:applicationId/cv/upload",
    stageTransition: "/applications/:applicationId/stage-transition",
    recruiterStageUpdate: "/recruiter/applications/:applicationId/stage",
  },
  jobs: {
    list: "/view/jobs",
    details: "/view/jobs/:jobProfileId",
    profileDetails: "/view/jobs/:jobProfileId",
    listQueryParam: "search",
    listPageParam: "page",
    listLimitParam: "size",
  },
  dashboard: {
    summary: "/dashboard/summary",
  },
  companies: {
    list: "/companies",
  },
  industries: {
    list: "/industries",
  },
  locations: {
    list: "/locations",
  },
  skills: {
    search: "/skills/search",
    generate: "/skills/generate",
    keywordParam: "keyword",
    limitParam: "limit",
  },
  ai: {
    parseResume: "/resume/parse",
    generateSkills: "/skills/generate",
    generateJobSkills: "/jobs/skills/generate",
    candidateActions: "/candidates/:candidateId/ai-actions",
  },
  recruiter: {
    dashboard: "https://13-245-120-61.nip.io/recruiter/dashboard",
    mandates: "https://13-245-120-61.nip.io/recruiter/mandates",
    pipeline: "https://13-245-120-61.nip.io/recruiter/pipeline",
    candidatesSearch: "https://13-245-120-61.nip.io/recruiter/candidates/search",
    mandateDetail: "https://13-245-120-61.nip.io/mandates/:mandateId",
    candidateProfile: "https://13-245-120-61.nip.io/candidates/:candidateId/profile",
  },
  pipeline: {
    stageUpdate: "https://13-245-120-61.nip.io/pipeline/:pipelineId/stage",
    jobStageAdvance: "https://13-245-120-61.nip.io/pipelines/jobs/:jobId/stage",
  },
  manco: {
    dashboard: "/manco/:mancoId/dashboard",
    recruiterPerformance: "/manco/recruiters/:id/performance",
  },
  jobPosts: {
    list: "/job-posts",
    create: "/jobs",
    detail: "/job-posts/:mandateId",
    update: "/job-posts/:mandateId",
    delete: "/job-posts/:mandateId",
  },
  crm: {
    clients: "/crm/clients",
    clientNotes: "/crm/clients/:clientId/notes",
    statusParam: "status",
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
