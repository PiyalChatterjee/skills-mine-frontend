import type { WorkflowConfig } from './workflow.types'

export const workflowConfig: WorkflowConfig = {
  stages: [
    'INBOUND',
    'SCREENING',
    'ASSESSMENT',
    'INTERVIEW',
    'SHORTLISTED',
    'OFFER',
    'PLACED',
    'CLOSED',
  ],
  transitions: [
    { from: 'INBOUND', to: ['SCREENING', 'CLOSED'] },
    { from: 'SCREENING', to: ['ASSESSMENT', 'CLOSED'] },
    { from: 'ASSESSMENT', to: ['INTERVIEW', 'CLOSED'] },
    { from: 'INTERVIEW', to: ['SHORTLISTED', 'CLOSED'] },
    { from: 'SHORTLISTED', to: ['OFFER', 'CLOSED'] },
    { from: 'OFFER', to: ['PLACED', 'CLOSED'] },
    { from: 'PLACED', to: ['CLOSED'] },
    { from: 'CLOSED', to: [] },
  ],
}
