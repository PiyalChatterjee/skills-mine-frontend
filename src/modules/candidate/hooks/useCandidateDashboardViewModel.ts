import { ApplicationStatusKey as ApplicationStatusValue, ApplicationStatusLabel, PipelineStageCode, PipelineStageLabel } from "@/enums/statuses";
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
  { label: string; color: string; caption: string }
> = {
  [ApplicationStatusValue.APPLIED]: {
    label: ApplicationStatusLabel.APPLIED,
    color: "#72c4e0",
    caption: "Your job application has been successfully submitted and is now with the recruiter.",
  },
  [ApplicationStatusValue.SCREENING]: {
    label: PipelineStageLabel.SCREENING,
    color: "#4db8c8",
    caption: "The recruiter is currently reviewing your application.",
  },
  [ApplicationStatusValue.ASSESSMENT]: {
    label: PipelineStageLabel.ASSESSMENT,
    color: "#f0a500",
    caption: "You have been invited to complete an assessment for this position.",
  },
  [ApplicationStatusValue.INTERVIEW]: {
    label: PipelineStageLabel.INTERVIEW,
    color: "#7c5cd8",
    caption: "Good news! You have been invited to an interview for this position.",
  },
  [ApplicationStatusValue.SHORTLISTED]: {
    label: ApplicationStatusLabel.SHORTLISTED,
    color: "#e085c2",
    caption: "Good news! You have been shortlisted for this position.",
  },
  [ApplicationStatusValue.OFFER_EXTENDED]: {
    label: PipelineStageLabel.OFFER,
    color: "#5bbf8a",
    caption: "Good news! An offer for this position has been extended to you!",
  },
  [ApplicationStatusValue.OFFER_ACCEPTED]: {
    label: PipelineStageLabel.CLOSED,
    color: "#4BAF73",
    caption: "Good news! You have accepted the offer for this position.",
  },
  [ApplicationStatusValue.OFFER_DECLINED]: {
    label: PipelineStageLabel.CLOSED,
    color: "#D64545",
    caption: "You have declined the offer for this position. Thank you for your interest!",
  },
  [ApplicationStatusValue.REJECTED]: {
    label: PipelineStageLabel.CLOSED,
    color: "#D64545",
    caption: "Unfortunately, your application for this position was not successful. Thank you for your interest!",
  },
  [ApplicationStatusValue.UNKNOWN]: {
    label: "Unknown stage",
    color: "#7a8694",
    caption: "Your application status is currently unavailable.",
  },
};

const CLOSED_STAGES = new Set([
  PipelineStageCode.CLOSED.toLowerCase(),
  ApplicationStatusValue.OFFER_ACCEPTED,
  ApplicationStatusValue.OFFER_DECLINED,
  PipelineStageCode.REJECT.toLowerCase(),
  PipelineStageCode.OFFER_REJECT.toLowerCase(),
  ApplicationStatusValue.REJECTED,
]);
const DEFAULT_PIPELINE = [
  PipelineStageCode.INBOUND,
  PipelineStageCode.SCREENING,
  PipelineStageCode.ASSESSMENT,
  PipelineStageCode.SHORTLIST,
  PipelineStageCode.INTERVIEW,
  PipelineStageCode.OFFER,
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
  if (status === ApplicationStatusValue.UNKNOWN && app.stage) {
    reportUnknownStage(app.stage);
  }
  const pipeline = DEFAULT_PIPELINE;
  // Rejected applications show progress up to the stage they were rejected at.
  const progressStage =
    status === ApplicationStatusValue.REJECTED && app.rejectedAtStage ? app.rejectedAtStage : app.stage;
  const progressStatus = getApplicationStatusKey(progressStage);
  const isClosedRejection =
    status === ApplicationStatusValue.REJECTED && app.jobStatus?.trim().toLowerCase() === "closed";
  let displayStatus = status;
  if (!isClosedRejection && status === ApplicationStatusValue.REJECTED && progressStatus !== ApplicationStatusValue.UNKNOWN) {
    displayStatus = progressStatus === ApplicationStatusValue.OFFER_EXTENDED ? ApplicationStatusValue.OFFER_DECLINED : progressStatus;
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
    fillPercent: isClosedRejection || displayStatus === ApplicationStatusValue.OFFER_DECLINED ? 100 : getPipelineFillPercent(progressStage, pipeline),
    message: DASHBOARD_APPLICATION_STATUS_CONFIG[displayStatus].caption,
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