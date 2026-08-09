export type WorkflowStage =
  | 'INBOUND'
  | 'SCREENING'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'SHORTLISTED'
  | 'OFFER'
  | 'PLACED'
  | 'CLOSED'

export interface WorkflowTransition {
  from: WorkflowStage
  to: WorkflowStage[]
}

export interface WorkflowConfig {
  stages: WorkflowStage[]
  transitions: WorkflowTransition[]
}
