import type { PipelineStageCode } from "@/enums/statuses"

export type WorkflowStage = PipelineStageCode

export interface WorkflowTransition {
  from: WorkflowStage
  to: WorkflowStage[]
}

export interface WorkflowConfig {
  stages: WorkflowStage[]
  transitions: WorkflowTransition[]
}
