import { ApplicationStatusKey, ApplicationStatusLabel, PipelineStageCode, PipelineStageLabel } from "@/enums/statuses";

export type { ApplicationStatusKey } from "@/enums/statuses";

const APPLICATION_STATUS_LABELS: Record<string, string> = {
  [PipelineStageCode.INBOUND.toLowerCase()]: ApplicationStatusLabel.APPLIED,
  [ApplicationStatusKey.APPLIED]: ApplicationStatusLabel.APPLIED,
  [ApplicationStatusKey.SCREENING]: PipelineStageLabel.SCREENING,
  [ApplicationStatusKey.ASSESSMENT]: PipelineStageLabel.ASSESSMENT,
  [ApplicationStatusKey.INTERVIEW]: PipelineStageLabel.INTERVIEW,
  [PipelineStageCode.SHORTLIST.toLowerCase()]: ApplicationStatusLabel.SHORTLISTED,
  [ApplicationStatusKey.SHORTLISTED]: ApplicationStatusLabel.SHORTLISTED,
  [PipelineStageCode.OFFER.toLowerCase()]: PipelineStageLabel.OFFER,
  [ApplicationStatusKey.OFFER_EXTENDED]: PipelineStageLabel.OFFER,
  [ApplicationStatusKey.OFFER_ACCEPTED]: PipelineStageLabel.CLOSED,
  [ApplicationStatusKey.OFFER_DECLINED]: PipelineStageLabel.CLOSED,
  [PipelineStageCode.REJECT.toLowerCase()]: PipelineStageLabel.CLOSED,
  [ApplicationStatusKey.REJECTED]: PipelineStageLabel.CLOSED,
  [PipelineStageCode.PLACED.toLowerCase()]: PipelineStageLabel.PLACED,
  [PipelineStageCode.CLOSED.toLowerCase()]: PipelineStageLabel.CLOSED,
};

const APPLICATION_STATUS_KEYS: Record<string, ApplicationStatusKey> = {
  [PipelineStageCode.INBOUND.toLowerCase()]: ApplicationStatusKey.APPLIED,
  [ApplicationStatusKey.APPLIED]: ApplicationStatusKey.APPLIED,
  [ApplicationStatusKey.SCREENING]: ApplicationStatusKey.SCREENING,
  [ApplicationStatusKey.ASSESSMENT]: ApplicationStatusKey.ASSESSMENT,
  [ApplicationStatusKey.INTERVIEW]: ApplicationStatusKey.INTERVIEW,
  [PipelineStageCode.SHORTLIST.toLowerCase()]: ApplicationStatusKey.SHORTLISTED,
  [ApplicationStatusKey.SHORTLISTED]: ApplicationStatusKey.SHORTLISTED,
  [PipelineStageCode.OFFER.toLowerCase()]: ApplicationStatusKey.OFFER_EXTENDED,
  [ApplicationStatusKey.OFFER_EXTENDED]: ApplicationStatusKey.OFFER_EXTENDED,
  [ApplicationStatusKey.OFFER_ACCEPTED]: ApplicationStatusKey.OFFER_ACCEPTED,
  // Backend moves an accepted offer to CLOSED.
  [PipelineStageCode.CLOSED.toLowerCase()]: ApplicationStatusKey.OFFER_ACCEPTED,
  [ApplicationStatusKey.OFFER_DECLINED]: ApplicationStatusKey.OFFER_DECLINED,
  [PipelineStageCode.REJECT.toLowerCase()]: ApplicationStatusKey.REJECTED,
  [ApplicationStatusKey.REJECTED]: ApplicationStatusKey.REJECTED,
};

export const getApplicationStatusLabel = (stage: string | undefined) => {
  if (!stage) return undefined;
  return APPLICATION_STATUS_LABELS[stage.trim().toLowerCase()] ?? stage;
};

export const getApplicationStatusKey = (
  stage: string | undefined | null,
): ApplicationStatusKey => {
  if (!stage) return ApplicationStatusKey.UNKNOWN;
  return APPLICATION_STATUS_KEYS[stage.trim().toLowerCase()] ?? ApplicationStatusKey.UNKNOWN;
};
