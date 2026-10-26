import type { PipelineStageCode } from "@/enums/statuses"

export type WorkflowStage = Exclude<
  PipelineStageCode,
  typeof PipelineStageCode.APPLIED | typeof PipelineStageCode.SHORTLISTED |
  typeof PipelineStageCode.REJECT | typeof PipelineStageCode.OFFER_REJECT
>

export interface WorkflowTransition {
  from: WorkflowStage
  to: WorkflowStage[]
}

export interface WorkflowConfig {
  stages: WorkflowStage[]
  transitions: WorkflowTransition[]
}
