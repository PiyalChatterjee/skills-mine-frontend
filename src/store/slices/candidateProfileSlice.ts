import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CandidateProfile } from '@/modules/candidate/types'

interface CandidateProfileState {
  profile: CandidateProfile | null
}

const initialState: CandidateProfileState = {
  profile: null,
}

const candidateProfileSlice = createSlice({
  name: 'candidateProfile',
  initialState,
  reducers: {
    setCandidateProfile: (state, action: PayloadAction<CandidateProfile>) => {
      state.profile = action.payload
    },
    clearCandidateProfile: (state) => {
      state.profile = null
    },
  },
})

export const { setCandidateProfile, clearCandidateProfile } = candidateProfileSlice.actions

export default candidateProfileSlice.reducer
