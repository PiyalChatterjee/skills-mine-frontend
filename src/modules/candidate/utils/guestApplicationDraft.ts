import type { Job, SaveBuildMyCvRequest } from "@/types";

export const GUEST_APPLICATION_DRAFT_STORAGE_KEY =
  "skillsmine.guest-application-drafts";

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type GuestApplicationStatus =
  | "pending-authentication"
  | "cv-completed"
  | "restoring"
  | "restored";

export type GuestApplicationDraft = {
  jobId: string;
  jobTitle: string;
  job: Job;
  applicationStatus: GuestApplicationStatus;
  sourceChannel: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  cvData?: SaveBuildMyCvRequest;
};

const isDraft = (value: unknown): value is GuestApplicationDraft => {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<GuestApplicationDraft>;
  return (
    typeof draft.jobId === "string" &&
    typeof draft.jobTitle === "string" &&
    draft.job !== undefined &&
    typeof draft.applicationStatus === "string" &&
    typeof draft.expiresAt === "string"
  );
};

const readStoredDrafts = (): GuestApplicationDraft[] => {
  try {
    const raw = sessionStorage.getItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const now = Date.now();
    const drafts = Array.isArray(parsed)
      ? parsed.filter(isDraft).filter((draft) => Date.parse(draft.expiresAt) > now)
      : [];

    if (raw && drafts.length === 0) {
      sessionStorage.removeItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY);
    }
    return drafts;
  } catch {
    sessionStorage.removeItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY);
    return [];
  }
};

const writeDrafts = (drafts: GuestApplicationDraft[]) => {
  if (drafts.length === 0) {
    sessionStorage.removeItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(GUEST_APPLICATION_DRAFT_STORAGE_KEY, JSON.stringify(drafts));
};

export const getGuestApplicationDrafts = () => readStoredDrafts();

export const createGuestApplicationDraft = (job: Job): GuestApplicationDraft => {
  const now = new Date();
  const existing = readStoredDrafts();
  const draft: GuestApplicationDraft = {
    jobId: job.jobId,
    jobTitle: job.title,
    job,
    applicationStatus: "pending-authentication",
    sourceChannel: "guest-cv-builder",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + DRAFT_TTL_MS).toISOString(),
  };
  const withoutCurrentJob = existing.filter((item) => item.jobId !== job.jobId);
  writeDrafts([...withoutCurrentJob, draft]);
  return draft;
};

export const saveGuestApplicationCv = (
  jobId: string,
  cvData: SaveBuildMyCvRequest,
) => {
  const now = new Date().toISOString();
  const drafts = readStoredDrafts().map((draft) =>
    draft.jobId === jobId
      ? {
          ...draft,
          cvData,
          applicationStatus: "cv-completed" as const,
          updatedAt: now,
        }
      : draft,
  );
  writeDrafts(drafts);
};

export const updateGuestApplicationDraft = (
  jobId: string,
  patch: Partial<Pick<GuestApplicationDraft, "applicationStatus">>,
) => {
  const drafts = readStoredDrafts().map((draft) =>
    draft.jobId === jobId
      ? { ...draft, ...patch, updatedAt: new Date().toISOString() }
      : draft,
  );
  writeDrafts(drafts);
};

export const clearRestoredGuestApplicationDrafts = () => {
  writeDrafts(
    readStoredDrafts().filter((draft) => draft.applicationStatus !== "restored"),
  );
};