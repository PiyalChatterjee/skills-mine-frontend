import { useMemo } from "react";
import { useAuth } from "@/app/auth/AuthContext";
import {
  getApplicationStatusKey,
  getApplicationStatusLabel,
  type ApplicationStatusKey,
} from "@/modules/candidate/utils/applicationStatus";
import {
  useCandidateDashboardQuery,
  useCandidateStatisticsQuery,
} from "@/modules/candidate/hooks/useCandidateQueries";
import type { DashboardApplication } from "@/types/api";

export const DASHBOARD_APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatusKey,
  { label: string; color: string; caption?: string }
> = {
  applied: {
    label: "Applied",
    color: "#72c4e0",
    caption: "Your application has been submitted.",
  },
  screening: {
    label: "Screening",
    color: "#4db8c8",
    caption: "Your application is under review.",
  },
  assessment: {
    label: "Assessment",
    color: "#f0a500",
    caption: "You have been invited to complete an assessment.",
  },
  interview: {
    label: "Interview",
    color: "#7c5cd8",
    caption: "You have been selected for an interview.",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#e085c2",
    caption: "You have been shortlisted for this role.",
  },
  offer_extended: {
    label: "Offer",
    color: "#5bbf8a",
    caption: "You have received an offer.",
  },
  offer_accepted: {
    label: "Closed",
    color: "#4BAF73",
    caption: "You have accepted the offer.",
  },
  offer_declined: {
    label: "Closed",
    color: "#D64545",
    caption: "You have declined the offer.",
  },
  rejected: {
    label: "Closed",
    color: "#D64545",
    caption: "Your application was not successful.",
  },
  unknown: { label: "Unknown stage", color: "#7a8694" },
};

const CLOSED_STAGES = new Set(["closed", "offer_accepted", "offer_declined", "reject", "rejected"]);
const DEFAULT_PIPELINE = [
  "APPLIED",
  "SCREENING",
  "ASSESSMENT",
  "INTERVIEW",
  "SHORTLISTED",
  "OFFER",
];
const unknownStages = new Set<string>();

const getPipelineProgress = (
  stage: string | undefined | null,
  pipeline: string[],
): number => {
  if (!stage || pipeline.length === 0) return 0;
  const status = getApplicationStatusKey(stage);
  const idx = pipeline.findIndex((pipelineStage) => getApplicationStatusKey(pipelineStage) === status);
  return idx >= 0 ? idx : 0;
};

const getPipelineFillPercent = (
  stage: string | undefined | null,
  pipeline: string[],
): number => {
  if (pipeline.length <= 1) return 0;
  if (stage && CLOSED_STAGES.has(stage.toLowerCase())) {
    return 100;
  }
  const idx = getPipelineProgress(stage, pipeline);
  return Math.round(((idx + 0.5) / pipeline.length) * 100);
};

const reportUnknownStage = (stage: string) => {
  const normalized = stage.trim().toLowerCase();
  if (!unknownStages.has(normalized)) {
    unknownStages.add(normalized);
    console.warn("[CandidateDashboardPage] Unknown application stage received from API", {
      stage,
      normalized,
    });
  }
};

type DisplayPipelineStage = {
  key: string;
  label: string | undefined;
  isActive: boolean;
};

export type DisplayApplication = {
  id: string;
  jobId: string;
  title: string;
  status: ApplicationStatusKey;
  pipelineStages: DisplayPipelineStage[];
  fillPercent: number;
  message: string;
  offerAccepted: boolean;
};

const transformApplicationToDisplay = (
  app: DashboardApplication,
): DisplayApplication => {
  const status = getApplicationStatusKey(app.stage);
  if (status === "unknown" && app.stage) {
    reportUnknownStage(app.stage);
  }
  const pipeline = DEFAULT_PIPELINE;
  // Rejected applications show progress up to the stage they were rejected at.
  const progressStage =
    status === "rejected" && app.rejectedAtStage ? app.rejectedAtStage : app.stage;
  const progressStatus = getApplicationStatusKey(progressStage);
  let displayStatus = status;
  if (status === "rejected" && progressStatus !== "unknown") {
    displayStatus = progressStatus === "offer_extended" ? "offer_declined" : progressStatus;
  }

  return {
    id: app.id,
    jobId: app.job.id,
    title: app.job.title,
    status: displayStatus,
    pipelineStages: pipeline.map((stageKey) => ({
      key: stageKey,
      label: getApplicationStatusLabel(stageKey),
      isActive: getApplicationStatusKey(stageKey) === progressStatus,
    })),
    fillPercent: displayStatus === "offer_declined" ? 100 : getPipelineFillPercent(progressStage, pipeline),
    message: app.statusMessage || DASHBOARD_APPLICATION_STATUS_CONFIG[displayStatus === "offer_declined" ? displayStatus : status].caption || "",
    offerAccepted: false,
  };
};

export const useCandidateDashboardViewModel = () => {
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useCandidateDashboardQuery(Boolean(user));
  const { data: statistics } = useCandidateStatisticsQuery(Boolean(user));

  const applications = useMemo(
    () => (dashboard?.applications ?? []).map(transformApplicationToDisplay),
    [dashboard?.applications],
  );
  const stats = statistics?.statistics;
  const totalApplications = stats?.totalApplications ?? 0;

  return {
    firstName: user?.firstName ?? "there",
    isLoading,
    isNewUser: !isLoading && applications.length === 0 && totalApplications === 0,
    applications,
    statistics: {
      totalApplications,
      successfulApplications: stats?.successfulApplications ?? 0,
      inProgressApplications: stats?.inProgressApplications ?? 0,
    },
  };
};