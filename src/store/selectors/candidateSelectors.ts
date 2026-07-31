import type { RootState } from '@/store'

export const selectCandidateProfile = (state: RootState) =>
  state.candidateProfile.profile

export const selectCandidateApplications = (state: RootState) =>
  state.candidateApplications.applications

export const selectCandidateApplicationIds = (state: RootState) =>
  state.candidateProfile.profile?.applications ?? []
