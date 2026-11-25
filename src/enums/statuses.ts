type ValueOf<T> = T[keyof T];

export const JobPostStatus = {
  POSTED: "POSTED",
  DRAFT: "DRAFT",
  CLOSED: "CLOSED",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  OPEN: "OPEN",
  FILLED: "FILLED",
} as const;
export type JobPostStatus = ValueOf<typeof JobPostStatus>;

export const JobPostStatusLabel = {
  POSTED: "Posted",
  DRAFT: "Draft",
  CLOSED: "Closed",
  OPEN: "Open",
} as const;
export type JobPostStatusLabel = ValueOf<typeof JobPostStatusLabel>;

export const MandateStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  ON_HOLD: "ON_HOLD",
} as const;
export type MandateStatus = ValueOf<typeof MandateStatus>;

export const ApplicationStatus = {
  SUBMITTED: "SUBMITTED",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  APPLIED: "APPLIED",
} as const;
export type ApplicationStatus = ValueOf<typeof ApplicationStatus>;

export const PipelineStageCode = {
  INBOUND: "INBOUND",
  SCREENING: "SCREENING",
  ASSESSMENT: "ASSESSMENT",
  SHORTLIST: "SHORTLIST",
  INTERVIEW: "INTERVIEW",
  OFFER: "OFFER",
  REJECT: "REJECT",
  OFFER_REJECT: "OFFER_REJECT",
  CLOSED: "CLOSED",
} as const;
export type PipelineStageCode = ValueOf<typeof PipelineStageCode>;

// Read compatibility only; these are not valid backend pipeline request codes.
export const LegacyPipelineStageCode = {
  APPLIED: "APPLIED",
  SHORTLISTED: "SHORTLISTED",
  PLACED: "PLACED",
} as const;
export type LegacyPipelineStageCode = ValueOf<typeof LegacyPipelineStageCode>;

export const PipelineStageLabel = {
  INBOUND: "Inbound",
  SCREENING: "Screening",
  ASSESSMENT: "Assessment",
  INTERVIEW: "Interview",
  SHORTLIST: "Shortlist",
  OFFER: "Offer",
  PLACED: "Placed",
  CLOSED: "Closed",
} as const;
export type PipelineStageLabel = ValueOf<typeof PipelineStageLabel>;

export const ApplicationStatusKey = {
  APPLIED: "applied",
  SCREENING: "screening",
  ASSESSMENT: "assessment",
  INTERVIEW: "interview",
  SHORTLISTED: "shortlisted",
  OFFER_EXTENDED: "offer_extended",
  OFFER_ACCEPTED: "offer_accepted",
  OFFER_DECLINED: "offer_declined",
  REJECTED: "rejected",
  UNKNOWN: "unknown",
} as const;
export type ApplicationStatusKey = ValueOf<typeof ApplicationStatusKey>;

export const ApplicationStatusLabel = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  SCREENED: "Screened",
  ASSESSED: "Assessed",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  OFFER_EXTENDED: "Offer Extended",
} as const;
export type ApplicationStatusLabel = ValueOf<typeof ApplicationStatusLabel>;

export const OfferResponseStatus = {
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type OfferResponseStatus = ValueOf<typeof OfferResponseStatus>;

export const ClosedReason = {
  HIRED: "Hired",
  REJECTED: "Rejected",
} as const;
export type ClosedReason = ValueOf<typeof ClosedReason>;

export const ProfileStatus = {
  INCOMPLETE: "INCOMPLETE",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DELETED: "DELETED",
} as const;
export type ProfileStatus = ValueOf<typeof ProfileStatus>;

export const DocumentLifecycleStatus = {
  ACTIVE: "ACTIVE",
  DELETED: "DELETED",
} as const;
export type DocumentLifecycleStatus = ValueOf<typeof DocumentLifecycleStatus>;

export const DocumentExtractionStatus = {
  NOT_STARTED: "NOT_STARTED",
} as const;
export type DocumentExtractionStatus = ValueOf<typeof DocumentExtractionStatus>;

export const CrmClassification = {
  NEEDS_ATTENTION: "needs_attention",
  HOT_LEAD: "hot_lead",
  WARM_CONTACT: "warm_contact",
  COLD_LEAD: "cold_lead",
} as const;
export type CrmClassification = ValueOf<typeof CrmClassification>;

export const CrmClassificationLabel = {
  NEEDS_ATTENTION: "Needs Attention",
  HOT_LEAD: "Hot Lead",
  WARM_CONTACT: "Warm Contact",
  COLD_LEAD: "Cold Lead",
} as const;
export type CrmClassificationLabel = ValueOf<typeof CrmClassificationLabel>;

export const GuestApplicationStatus = {
  PENDING_AUTHENTICATION: "pending-authentication",
  CV_COMPLETED: "cv-completed",
  RESTORING: "restoring",
  RESTORED: "restored",
} as const;
export type GuestApplicationStatus = ValueOf<typeof GuestApplicationStatus>;
