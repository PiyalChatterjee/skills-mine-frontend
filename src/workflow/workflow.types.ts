export type WorkflowStage =
  | 'INBOUND'
  | 'SCREENING'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'SHORTLIST'
  | 'OFFER'
  | 'CLOSED'

export interface WorkflowTransition {
  from: WorkflowStage
  to: WorkflowStage[]
}

export interface WorkflowConfig {
  stages: WorkflowStage[]
  transitions: WorkflowTransition[]
}
