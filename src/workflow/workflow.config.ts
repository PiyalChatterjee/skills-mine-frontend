import { PipelineStageCode } from "@/enums/statuses";
import type { WorkflowConfig } from './workflow.types'

export const workflowConfig: WorkflowConfig = {
  stages: [
    PipelineStageCode.INBOUND,
    PipelineStageCode.SCREENING,
    PipelineStageCode.ASSESSMENT,
    PipelineStageCode.SHORTLIST,
    PipelineStageCode.INTERVIEW,
    PipelineStageCode.OFFER,
    PipelineStageCode.REJECT,
    PipelineStageCode.OFFER_REJECT,
    PipelineStageCode.CLOSED,
  ],
  transitions: [
    { from: PipelineStageCode.INBOUND, to: [PipelineStageCode.SCREENING, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.SCREENING, to: [PipelineStageCode.ASSESSMENT, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.ASSESSMENT, to: [PipelineStageCode.SHORTLIST, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.SHORTLIST, to: [PipelineStageCode.INTERVIEW, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.INTERVIEW, to: [PipelineStageCode.OFFER, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.OFFER, to: [PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.REJECT, to: [] },
    { from: PipelineStageCode.OFFER_REJECT, to: [] },
    { from: PipelineStageCode.CLOSED, to: [] },
  ],
}
