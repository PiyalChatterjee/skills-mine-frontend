import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CandidateApplication } from '@/modules/candidate/types'

interface CandidateApplicationsState {
  applications: CandidateApplication[]
}

const initialState: CandidateApplicationsState = {
  applications: [],
}

const candidateApplicationsSlice = createSlice({
  name: 'candidateApplications',
  initialState,
  reducers: {
    setCandidateApplications: (state, action: PayloadAction<CandidateApplication[]>) => {
      state.applications = action.payload
    },
    clearCandidateApplications: (state) => {
      state.applications = []
    },
  },
})

export const { setCandidateApplications, clearCandidateApplications } =
  candidateApplicationsSlice.actions

export default candidateApplicationsSlice.reducer
