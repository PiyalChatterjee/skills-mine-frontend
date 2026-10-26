import { PipelineStageCode } from "@/enums/statuses";
import type { WorkflowConfig } from './workflow.types'

export const workflowConfig: WorkflowConfig = {
  stages: [
    PipelineStageCode.INBOUND,
    PipelineStageCode.SCREENING,
    PipelineStageCode.ASSESSMENT,
    PipelineStageCode.INTERVIEW,
    PipelineStageCode.SHORTLIST,
    PipelineStageCode.OFFER,
    PipelineStageCode.PLACED,
    PipelineStageCode.CLOSED,
  ],
  transitions: [
    { from: PipelineStageCode.INBOUND, to: [PipelineStageCode.SCREENING, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.SCREENING, to: [PipelineStageCode.ASSESSMENT, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.ASSESSMENT, to: [PipelineStageCode.INTERVIEW, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.INTERVIEW, to: [PipelineStageCode.SHORTLIST, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.SHORTLIST, to: [PipelineStageCode.OFFER, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.OFFER, to: [PipelineStageCode.PLACED, PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.PLACED, to: [PipelineStageCode.CLOSED] },
    { from: PipelineStageCode.CLOSED, to: [] },
  ],
}
