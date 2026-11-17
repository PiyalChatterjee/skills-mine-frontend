import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApplicationStatusLabel, JobPostStatus, JobPostStatusLabel } from "@/enums/statuses";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { extractErrorMessage } from "@/app/errorUtils";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import { useJobs } from "@/modules/public/hooks/useJobs";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { jobsApi } from "@/services/api/jobsApi";
import {
  useApplyToJobMutation,
  useGetJobByIdQuery,
  useGetJobProfileQuery,
} from "@/store/api/apiSlice";
import type { Job } from "@/types";
import { createGuestApplicationDraft } from "../utils/guestApplicationDraft";
import { getJobOperationId } from "../utils/jobIdentifier";
import { getJobCity } from "@/components/jobs/jobPresentation";
import { useSavedJobsQuery } from "./useCandidateQueries";
import { useAppliedJobIds } from "./useAppliedJobIds";
import { useOptimisticSaveJob } from "./useOptimisticSaveJob";

type LocationState = {
  job?: Job;
  from?: string;
  // Set by LoginPage when the user was redirected here from the visitor
  // "candidate already exists" flow, so the pending application completes automatically.
  autoApply?: boolean;
};

const allowedBackRoutes = new Set<string>([
  ROUTE_PATHS.latestJobs,
  ROUTE_PATHS.savedJobs,
  ROUTE_PATHS.recommendedJobs,
  ROUTE_PATHS.candidateDashboard,
]);

const fallbackSkills = [
  "User Experience Strategy",
  "Design Thinking",
  "Team Collaboration",
  "Interaction Design",
  "User Research",
];

const toDisplayTitle = (value: string | undefined, fallback: string) => {
  if (!value || value.trim().length === 0) return fallback;
  return value;
};

const formatPostedDate = (dateValue?: string) => {
  if (!dateValue) return "12 November 2025";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "12 November 2025";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export const useJobDetailsViewModel = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const savedJobsQuery = useSavedJobsQuery(true);
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const { isJobApplied } = useAppliedJobIds();
  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();
  const [hasJustApplied, setHasJustApplied] = useState(false);
  const [isApplySuccessModalOpen, setIsApplySuccessModalOpen] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const { data, isLoading } = useJobs(undefined, true, 50);

  const locationState = location.state as LocationState | null;
  const stateJob = locationState?.job;
  const backRoute =
    locationState?.from && allowedBackRoutes.has(locationState.from)
      ? locationState.from
      : ROUTE_PATHS.latestJobs;

  const allJobs = useMemo(() => {
    return (data?.pages ?? []).flatMap((page) => page?.jobs ?? []);
  }, [data]);

  const resolvedJob = useMemo(() => {
    if (!jobId) {
      return stateJob;
    }

    return allJobs.find((job) => job.jobId === jobId) ?? stateJob;
  }, [allJobs, jobId, stateJob]);

  // Job routes may start with a reference number; resolve the canonical profile id before detail/apply requests.
  const knownJobProfileId = resolvedJob?.jobProfileId;
  const { data: jobById } = useGetJobByIdQuery(jobId ?? "", {
    skip: !jobId || Boolean(knownJobProfileId),
  });
  const jobProfileId = knownJobProfileId ?? jobById?.jobProfileId;
  const { data: jobProfile, isFetching: isJobProfileLoading } =
    useGetJobProfileQuery(jobProfileId ?? "", {
      skip: !jobProfileId,
    });

  const displayJob = useMemo(() => {
    const base = resolvedJob ?? stateJob ?? jobById;
    if (!base) return undefined;
    return {
      ...stateJob,
      ...base,
      ...jobById,
      ...jobProfile,
      jobId: base.jobId,
    };
  }, [jobById, jobProfile, resolvedJob, stateJob]);

  const effectiveJob = resolvedJob ?? jobById;
  // Saved-job state uses the same canonical identifier as save, remove, and apply mutations.
  const savedJobKey = effectiveJob ? getJobOperationId(effectiveJob) : "";
  const savedJobKeysFromCollection = useMemo(
    () =>
      new Set(
        (savedJobsQuery.data?.jobs ?? []).map(getJobOperationId),
      ),
    [savedJobsQuery.data],
  );
  const isSaved = savedJobKey
    ? isJobSaved(savedJobKey) || savedJobKeysFromCollection.has(savedJobKey)
    : false;
  const isSaving = savedJobKey ? isJobSaving(savedJobKey) : false;
  const isApplied = effectiveJob
    ? hasJustApplied || isJobApplied(effectiveJob.jobId)
    : false;
  const isClosed = displayJob?.status?.trim().toUpperCase() === JobPostStatus.CLOSED;
  const isApplyDisabled = isApplying || isApplied || isClosed || isJobProfileLoading;

  // Best-effort view tracking, once per job per page load.
  const hasTrackedViewRef = useRef<string | null>(null);
  useEffect(() => {
    if (!jobProfileId || hasTrackedViewRef.current === jobProfileId) return;
    hasTrackedViewRef.current = jobProfileId;
    void jobsApi.incrementViewCount(jobProfileId).catch(() => {
      // Non-critical — view count tracking failures shouldn't affect the candidate.
    });
  }, [jobProfileId]);

  const handleApply = useCallback(async () => {
    if (!effectiveJob || isApplyDisabled) return;
    setApplyError(null);

    if (!isAuthenticated) {
      createGuestApplicationDraft(displayJob ?? effectiveJob);
      navigate(`${ROUTE_PATHS.cvBuilder}?job=${encodeURIComponent(effectiveJob.jobId)}`, {
        state: { guestApplicationJobId: effectiveJob.jobId },
      });
      return;
    }

    if (user?.role !== "JOB_SEEKER") {
      setApplyError("Only candidate accounts can apply for jobs.");
      return;
    }

    try {
      await applyToJob({ jobProfileId: effectiveJob.jobProfileId ?? effectiveJob.jobId }).unwrap();
      setHasJustApplied(true);
      setIsApplySuccessModalOpen(true);
    } catch (error) {
      setApplyError(extractErrorMessage(error, "Unable to submit your application."));
    }
  }, [applyToJob, displayJob, effectiveJob, isApplyDisabled, isAuthenticated, navigate, user?.role]);

  // Auto-submits the pending application once, after login redirected here with autoApply state.
  const hasAutoAppliedRef = useRef(false);
  useEffect(() => {
    if (
      !locationState?.autoApply ||
      hasAutoAppliedRef.current ||
      !effectiveJob ||
      isApplyDisabled
    ) {
      return;
    }

    hasAutoAppliedRef.current = true;
    void handleApply();
  }, [effectiveJob, handleApply, isApplyDisabled, locationState?.autoApply]);

  const handleToggleSave = () => {
    if (!effectiveJob) return;
    const saveTargetId = getJobOperationId(effectiveJob);
    void toggleJobSaved(saveTargetId);
  };

  const title = toDisplayTitle(displayJob?.title, "");
  const companyName = toDisplayTitle(displayJob?.company, "");
  const industry = toDisplayTitle(displayJob?.industry, "");
  const locationName = getJobCity(displayJob?.location, "Johannesburg");
  const workType = formatEnumLabel(toDisplayTitle(displayJob?.workType, ""));
  const employmentType = formatEnumLabel(toDisplayTitle(displayJob?.employmentType, ""));
  const experienceLevel = toDisplayTitle(displayJob?.experienceLevel, "");
  const requirements =
    displayJob?.requirements && displayJob.requirements.length > 0
      ? displayJob.requirements
      : [];
  const responsibilities =
    displayJob?.responsibilities && displayJob.responsibilities.length > 0
      ? displayJob.responsibilities
      : [];
  const benefitsText =
    displayJob?.benefitsText && displayJob.benefitsText.length > 0
      ? displayJob.benefitsText
      : [];
  const skills =
    displayJob?.skills && displayJob.skills.length > 0
      ? displayJob.skills.slice(0, 5)
      : fallbackSkills;

  return {
    applyButtonLabel: isApplying ? "Applying..." : isApplied ? ApplicationStatusLabel.APPLIED : isClosed ? JobPostStatusLabel.CLOSED : "Apply",
    applyError,
    backRoute,
    benefitsText,
    companyName,
    description: displayJob?.description ?? "",
    employmentType,
    experienceLevel,
    fillByDate: displayJob?.fillByDate ?? "",
    handleApply,
    handleBack: () => navigate(backRoute),
    handleBackToLatest: () => navigate(ROUTE_PATHS.latestJobs),
    handleApplySuccessClose: () => setIsApplySuccessModalOpen(false),
    handleApplySuccessDashboard: () => navigate(ROUTE_PATHS.candidateDashboard),
    handleToggleSave,
    industry,
    isApplied,
    isApplyDisabled,
    isApplySuccessModalOpen,
    isApplying,
    isAuthenticated,
    isInitialLoading: (isLoading || isJobProfileLoading) && !effectiveJob,
    isNotFound: !effectiveJob,
    isSaved,
    isSaving,
    jobReferenceNumber: effectiveJob?.jobId ?? "",
    locationName,
    postedDate: formatPostedDate(displayJob?.postedDate),
    requirements,
    responsibilities,
    salaryRange: displayJob?.isSalaryHidden || isJobProfileLoading
      ? ""
      : displayJob?.salaryRange || "Negotiable",
    saveAriaLabel: isSaved ? `Unsave ${title}` : `Save ${title}`,
    footerSaveLabel: isSaved ? "Saved" : "Save",
    skills,
    title,
    workType,
  };
};