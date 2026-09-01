import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import { useJobs } from "@/modules/public/hooks/useJobs";
import { ROUTE_PATHS } from "@/routes/routePaths";
import {
  useApplyToJobMutation,
  useGetJobByIdQuery,
  useGetJobProfileQuery,
} from "@/store/api/apiSlice";
import type { Job } from "@/types";
import { createGuestApplicationDraft } from "../utils/guestApplicationDraft";
import { useAppliedJobIds } from "./useAppliedJobIds";
import { useOptimisticSaveJob } from "./useOptimisticSaveJob";

type LocationState = {
  job?: Job;
  from?: string;
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

const toCityFromLocation = (location?: string) => {
  if (!location) return "Johannesburg";
  const [city] = location.split(",");
  return city?.trim() || "Johannesburg";
};

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

const getErrorMessage = (error: unknown) => {
  return typeof error === "object" && error !== null && "message" in error
    ? String((error as { message?: unknown }).message ?? "Unable to submit your application.")
    : "Unable to submit your application.";
};

export const useJobDetailsViewModel = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const { isJobApplied } = useAppliedJobIds();
  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();
  const [hasJustApplied, setHasJustApplied] = useState(false);
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
    if (stateJob && stateJob.jobId === jobId) {
      return stateJob;
    }

    if (!jobId) {
      return stateJob;
    }

    return allJobs.find((job) => job.jobId === jobId) ?? stateJob;
  }, [allJobs, jobId, stateJob]);

  const { data: jobById } = useGetJobByIdQuery(jobId ?? "", { skip: !jobId });
  const jobProfileId = jobById?.jobProfileId ?? resolvedJob?.jobProfileId;
  const { data: jobProfile, isFetching: isJobProfileLoading } =
    useGetJobProfileQuery(jobProfileId ?? "", {
      skip: !jobProfileId,
    });

  const displayJob = useMemo(() => {
    const base = resolvedJob ?? jobById;
    if (!base) return undefined;
    return { ...base, ...jobById, ...jobProfile, jobId: base.jobId };
  }, [resolvedJob, jobById, jobProfile]);

  const effectiveJob = resolvedJob ?? jobById;
  const isSaved = effectiveJob ? isJobSaved(effectiveJob.jobId) : false;
  const isSaving = effectiveJob ? isJobSaving(effectiveJob.jobId) : false;
  const isApplied = effectiveJob
    ? hasJustApplied || isJobApplied(effectiveJob.jobId)
    : false;

  const handleApply = async () => {
    if (!effectiveJob || isApplied || isApplying) return;
    setApplyError(null);

    if (!isAuthenticated) {
      createGuestApplicationDraft(effectiveJob);
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
    } catch (error) {
      setApplyError(getErrorMessage(error));
    }
  };

  const handleToggleSave = () => {
    if (!effectiveJob) return;
    void toggleJobSaved(effectiveJob.jobId);
  };

  const title = toDisplayTitle(displayJob?.title, "");
  const companyName = toDisplayTitle(displayJob?.company, "");
  const industry = toDisplayTitle(displayJob?.industry, "");
  const locationName = toCityFromLocation(displayJob?.location);
  const workType = formatEnumLabel(toDisplayTitle(displayJob?.workType, ""));
  const employmentType = formatEnumLabel(toDisplayTitle(displayJob?.employmentType, ""));
  const requirements =
    displayJob?.requirements && displayJob.requirements.length > 0
      ? displayJob.requirements
      : [];
  const responsibilities =
    displayJob?.responsibilities && displayJob.responsibilities.length > 0
      ? displayJob.responsibilities
      : [];
  const skills =
    displayJob?.skills && displayJob.skills.length > 0
      ? displayJob.skills.slice(0, 5)
      : fallbackSkills;

  return {
    applyButtonLabel: isApplying ? "Applying..." : isApplied ? "Applied" : "Apply now",
    applyError,
    backRoute,
    companyName,
    employmentType,
    handleApply,
    handleBack: () => navigate(backRoute),
    handleBackToLatest: () => navigate(ROUTE_PATHS.latestJobs),
    handleToggleSave,
    industry,
    isApplied,
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
    salaryRange: displayJob?.salaryRange || "Negotiable",
    saveAriaLabel: isSaved ? `Unsave ${title}` : `Save ${title}`,
    footerSaveLabel: isSaved ? "Saved" : "Save",
    skills,
    title,
    workType,
  };
};