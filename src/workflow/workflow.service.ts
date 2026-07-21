import { workflowConfig } from './workflow.config'
import type { WorkflowStage } from './workflow.types'

class WorkflowService {
  getStages(): WorkflowStage[] {
    return workflowConfig.stages
  }

  canTransition(from: WorkflowStage, to: WorkflowStage): boolean {
    const transition = workflowConfig.transitions.find((item) => item.from === from)
    if (!transition) return false
    return transition.to.includes(to)
  }

  getNextStages(stage: WorkflowStage): WorkflowStage[] {
    const transition = workflowConfig.transitions.find((item) => item.from === stage)
    return transition?.to ?? []
  }
}

export const workflowService = new WorkflowService()
